// controllers/dashboardController.js
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";

export const getDashboardSummary = async (req, res) => {
  try {
    // 1) Counts
    const totalProducts = await Product.countDocuments();

    // 2) Total stock units (sum of product.quantity)
    const stockAgg = await Product.aggregate([
      { $group: { _id: null, totalQty: { $sum: "$quantity" } } }
    ]);
    const totalUnitsInInventory = stockAgg[0]?.totalQty || 0;

    // 3) Low stock list (quantity < threshold)
    const lowStock = await Product.find({ $expr: { $lt: ["$quantity", "$threshold"] } })
      .select("name sku SKU quantity threshold") // (covering both sku/SKU naming)
      .sort({ quantity: 1 })
      .limit(20);

    // 4) Recent 5 stock movements
    const recentMovements = await StockMovement.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("product", "name sku SKU")
      .populate("createdBy", "name email");

    return res.status(200).json({
      totalProducts,
      totalUnitsInInventory,
      lowStock,
      recentMovements
    });
  } catch (err) {
    return res.status(500).json({ message: "Error building dashboard summary", error: err.message });
  }
};
