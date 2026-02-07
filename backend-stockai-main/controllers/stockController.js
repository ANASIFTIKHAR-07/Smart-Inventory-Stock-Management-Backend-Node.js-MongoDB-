import StockMovement from "../models/StockMovement.js";
import Product from "../models/Product.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import { NotificationService } from "../utils/notificationService.js";
import { sendEmail, sendHtmlEmail } from "../utils/email.js";
import { buildAdminPOHtml } from "./purchaseOrderController.js";

export const addStockMovement = async (req, res) => {
  try {
    const { productId, movementType, quantity, remarks, supplierId, date } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (movementType === "IN") {
      product.stockQty += quantity;
    } else if (movementType === "OUT") {
      if (product.stockQty < quantity) {
        return res.status(400).json({ message: "Not enough stock available" });
      }
      product.stockQty -= quantity;
      if (product.stockQty < product.minThreshold) {
        try {
          const poQty = Math.max(1, product.minThreshold * 2);
          const po = new PurchaseOrder({
            product: product._id,
            supplier: product.supplier,
            quantity: poQty,
            status: "Pending",
            createdBy: req.user?.id,
            expectedDate: product.leadTime ? new Date(Date.now() + (product.leadTime * 24 * 60 * 60 * 1000)) : undefined,
            notes: `Auto-created due to low stock after stock-out (current ${product.stockQty}, min ${product.minThreshold})`,
          });
          await po.save();
          await NotificationService.notifyAdmin(
            "Auto Purchase Order Created",
            `PO ${po._id} created for product ${product.name}`,
            { productId: product._id, supplierId: product.supplier, quantity: poQty }
          );
          try {
            const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
            if (adminEmail) {
              const subject = `Auto PO Created for ${product.name}`;
              const html = buildAdminPOHtml(po, product);
              const text = `Auto PO ${po._id} created for ${product.name} (qty ${po.quantity}). Visit admin portal to approve.`;
              await sendHtmlEmail(adminEmail, subject, html, text);
            }
          } catch (emailErr) {
            console.error("Email send error:", emailErr?.message || emailErr);
          }
        } catch (e) {
          console.error("Failed to auto-create Purchase Order:", e.message);
        }
      }
    } else {
      return res.status(400).json({ message: "Invalid movement type" });
    }

    const movement = new StockMovement({
      product: product._id,
      movementType,
      quantity,
      remarks,
      supplierId,
      createdBy: req.user.id,
      movementDate: date || Date.now(),
    });

    await product.save();
    await movement.save();

    let warning = null;
    if (product.stockQty < product.minThreshold) {
      warning = `⚠️ Product '${product.name}' is below threshold (${product.stockQty}/${product.minThreshold})`;
    }

    res.status(201).json({ message: "Stock movement recorded", product, movement, warning });
  } catch (error) {
    res.status(500).json({ message: "Error in stock movement", error: error.message });
  }
};
