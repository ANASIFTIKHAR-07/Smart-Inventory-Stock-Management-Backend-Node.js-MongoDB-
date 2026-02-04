import Product from "../models/Product.js";
import PurchaseOrder from "../models/PurchaseOrder.js";

export const getAlerts = async (req, res) => {
  try {
    const alerts = [];

    // Low Stock
    const lowStock = await Product.find({ $expr: { $lt: ["$stockQty", "$minThreshold"] } })
      .select("name stockQty minThreshold");
    lowStock.forEach((p) => {
      alerts.push({ type: "Low Stock", message: `Product '${p.name}' is below threshold (${p.stockQty}/${p.minThreshold})` });
    });

    // Predicted Shortage (placeholder: minThreshold *2 < stock triggers none; else if close)
    const nearShortage = await Product.find({ $expr: { $lt: ["$stockQty", { $multiply: ["$minThreshold", 2] } ] } })
      .select("name stockQty minThreshold");
    nearShortage.forEach((p) => {
      alerts.push({ type: "Predicted Shortage", message: `Product '${p.name}' may run short soon.` });
    });

    // Supplier Delay (placeholder: any pending POs older than 14 days)
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const delayed = await PurchaseOrder.find({ status: "Pending", createdAt: { $lt: fourteenDaysAgo } })
      .populate("supplier", "name")
      .select("supplier createdAt");
    delayed.forEach((po) => {
      alerts.push({ type: "Supplier Delay", message: `Pending PO older than 14 days for supplier '${po.supplier?.name || "Unknown"}'` });
    });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Failed to get alerts", error: error.message });
  }
};


