import StockMovement from "../models/StockMovement.js";
import Product from "../models/Product.js";
import Supplier from "../models/User.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import PDFDocument from "pdfkit";

export const getStockSummary = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalSuppliers = await Supplier.countDocuments();
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lt: ["$stockQty", "$minThreshold"] }
    });

    res.json({
      totalProducts,
      totalSuppliers,
      lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stock summary", error: error.message });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const topProducts = await StockMovement.aggregate([
      {
        $group: {
          _id: "$product",
          totalQty: { $sum: "$quantity" },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ]);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch top products", error: error.message });
  }
};

export const getRecentMovements = async (req, res) => {
  try {
    const movements = await StockMovement.find()
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recent movements", error: error.message });
  }
};

export const getProductStockReport = async (req, res) => {
  try {
    const products = await Product.find().populate("supplier", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product stock report", error: error.message });
  }
};

export const getSupplierStockReport = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch supplier stock report", error: error.message });
  }
};

export const getPurchaseOrderReport = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find()
      .populate("supplier", "name")
      .populate("products.product", "name");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch purchase orders", error: error.message });
  }
};

export const getLowStockReport = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lt: ["$stockQty", "$minThreshold"] }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch low stock report", error: error.message });
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const monthParam = (req.query.month || "").trim();
    const now = new Date();

    const getMonthRange = (year, monthIndex) => ({
      start: new Date(year, monthIndex, 1),
      end: new Date(year, monthIndex + 1, 1),
      label: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
    });

    let targetYear, targetMonthIdx;
    if (/^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split("-").map(Number);
      targetYear = y;
      targetMonthIdx = m - 1;
    } else {
      targetYear = now.getFullYear();
      targetMonthIdx = now.getMonth();
    }

    const primary = getMonthRange(targetYear, targetMonthIdx);

    const buildDateMatch = (range) => ({
      $or: [
        { createdAt: { $gte: range.start, $lt: range.end } },
        { movementDate: { $gte: range.start, $lt: range.end } },
      ],
    });

    const runAggregations = async (range) => {
      const dateMatch = buildDateMatch(range);

      const movements = await StockMovement.aggregate([
        { $match: dateMatch },
        { $group: { _id: "$movementType", totalQty: { $sum: "$quantity" } } },
      ]);

      const totalSalesAgg = await StockMovement.aggregate([
        { $match: { ...dateMatch, movementType: "OUT" } },
        { $group: { _id: null, totalSales: { $sum: "$quantity" } } },
      ]);

      const topProducts = await StockMovement.aggregate([
        { $match: { ...dateMatch, movementType: "OUT" } },
        { $group: { _id: "$product", totalSold: { $sum: "$quantity" } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        { $project: { name: "$product.name", totalSold: 1 } },
      ]);

      const damageAgg = await StockMovement.aggregate([
        {
          $match: {
            ...dateMatch,
            $or: [
              { movementType: { $regex: /^damage/i } },
              { remarks: { $regex: /damaged/i } },
            ],
          },
        },
        { $group: { _id: null, totalDamaged: { $sum: "$quantity" } } },
      ]);

      return {
        movements,
        totalSales: totalSalesAgg[0]?.totalSales || 0,
        topProducts,
        totalDamaged: damageAgg[0]?.totalDamaged || 0,
      };
    };

    let { movements, totalSales, topProducts, totalDamaged } = await runAggregations(primary);
    const hasInOrOut = movements.some(m => String(m._id).toUpperCase() === 'IN' || String(m._id).toUpperCase() === 'OUT');

    if (!monthParam && (!hasInOrOut || (totalSales === 0 && topProducts.length === 0))) {
      const prevMonthIdx = targetMonthIdx - 1;
      const prevYear = prevMonthIdx < 0 ? targetYear - 1 : targetYear;
      const prevIdxNorm = (prevMonthIdx + 12) % 12;
      const fallback = getMonthRange(prevYear, prevIdxNorm);
      const agg = await runAggregations(fallback);
      if (agg.movements.length || agg.totalSales || agg.topProducts.length || agg.totalDamaged) {
        movements = agg.movements;
        totalSales = agg.totalSales;
        topProducts = agg.topProducts;
        totalDamaged = agg.totalDamaged;
        primary.label = fallback.label;
      }
    }

    const productsSnapshot = await Product.aggregate([
      { $group: { _id: null, totalProducts: { $sum: 1 }, totalStockQty: { $sum: "$stockQty" } } },
    ]);

    const summary = {
      month: primary.label,
      movements,
      inventory: productsSnapshot[0] || { totalProducts: 0, totalStockQty: 0 },
      totalSales,
      topProducts,
      totalDamaged,
    };

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=monthly-report.pdf");

    doc.pipe(res);

    doc.fontSize(18).text("Monthly Stock Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Month: ${summary.month}`);
    doc.moveDown();

    doc.text("Movements:");
    const movementMap = new Map();
    movements.forEach((m) => {
      const key = String(m._id).toUpperCase();
      movementMap.set(key, (movementMap.get(key) || 0) + (m.totalQty || 0));
    });
    const inQty = movementMap.get('IN') || 0;
    const outQty = movementMap.get('OUT') || 0;
    if (inQty || outQty) {
      if (inQty) doc.text(`- IN: ${inQty}`);
      if (outQty) doc.text(`- OUT: ${outQty}`);
    } else {
      movements.forEach((m) => {
        doc.text(`- ${m._id}: ${m.totalQty}`);
      });
    }
    doc.moveDown();

    doc.text(`Total Sales This Month: ${totalSales}`);
    doc.moveDown();

    doc.text("Top Selling Products:");
    summary.topProducts.forEach((p, i) => {
      doc.text(`${i + 1}. ${p.name} — Sold: ${p.totalSold}`);
    });
    doc.moveDown();

    doc.text(`Stock Lost Due to Damages: ${totalDamaged}`);
    doc.moveDown();

    doc.text("Inventory Summary:");
    doc.text(`Total Products: ${summary.inventory.totalProducts}`);
    doc.text(`Total Stock Qty: ${summary.inventory.totalStockQty}`);

    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Failed to build monthly report", error: error.message });
  }
};
