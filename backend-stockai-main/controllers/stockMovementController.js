import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import { checkThreshold } from "../utils/checkThreshold.js";

export const addStockMovement = async (req, res) => {
  try {
    const { product, movementType, quantity, remarks, supplierId, date } = req.body;

    if (!product || !movementType || !quantity) {
      return res.status(400).json({ message: "Product, movementType, and quantity are required." });
    }

    const productDoc = await Product.findById(product);
    if (!productDoc) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (movementType === "IN") {
      productDoc.stockQty += quantity;
    } else if (movementType === "OUT") {
      if (productDoc.stockQty < quantity) {
        return res.status(400).json({ message: "Insufficient stock." });
      }
      productDoc.stockQty -= quantity;
    } else {
      return res.status(400).json({ message: "movementType must be IN or OUT." });
    }

    await productDoc.save();

    const movement = await StockMovement.create({
      product,
      movementType,
      quantity,
      remarks,
      supplierId,
      createdBy: req.user?.id,
      movementDate: date || Date.now(),
    });

    const thresholdResult = checkThreshold(productDoc);

    res.status(201).json({
      message: "Stock movement recorded successfully.",
      movement,
      updatedProduct: productDoc,
      ...thresholdResult,
    });
  } catch (error) {
    console.error("Error in addStockMovement:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getStockMovements = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "productId is required." });
    }

    const movements = await StockMovement.find({ product: productId })
      .populate("product", "name SKU stockQty minThreshold")
      .populate("createdBy", "name email")
      .populate("supplierId", "name email supplier.companyName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: movements.length,
      movements,
    });
  } catch (error) {
    console.error("Error in getStockMovements:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
