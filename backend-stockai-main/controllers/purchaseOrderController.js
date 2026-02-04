// controllers/purchaseOrderController.js
import PurchaseOrder from "../models/PurchaseOrder.js";
import User from "../models/User.js";
import crypto from "crypto";
import { sendPurchaseOrderEmail, sendHtmlEmail } from "../utils/email.js";

// ✅ Create Purchase Order + Send Email
// ✅ Create Purchase Order + Send Email
export const createPurchaseOrder = async (req, res) => {
  try {
    const { supplierId, product, quantity, status, createdBy, expectedDate, notes } = req.body;

    // ✅ Validate required fields
    const missingFields = [];
    if (!supplierId) missingFields.push("supplierId");
    if (!product) missingFields.push("product");
    if (!quantity) missingFields.push("quantity");
    if (!createdBy) missingFields.push("createdBy");
    if (!expectedDate) missingFields.push("expectedDate");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Required fields are missing: ${missingFields.join(", ")}`
      });
    }

    // 1. Check if supplier exists and role is supplier
    const supplier = await User.findOne({ _id: supplierId, role: "supplier" });
    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    // 2. Create purchase order
    const purchaseOrder = new PurchaseOrder({
      supplier: supplierId,
      product,
      quantity,
      status: status || "Pending",
      createdBy,
      expectedDate,
      notes,
    });

    await purchaseOrder.save();

    // 3. Populate product
    const populatedOrder = await purchaseOrder.populate("product", "name price");

    // 4. Send email to supplier
    await sendPurchaseOrderEmail(
      supplier.email,
      supplier.name,
      populatedOrder.product?.name || "N/A",
      quantity,
      status || "Pending",
      expectedDate,
      notes
    );

    res.status(201).json({
      success: true,
      message: "Purchase order created & email sent",
      purchaseOrder: populatedOrder
    });
  } catch (error) {
    console.error("❌ Error creating purchase order:", error);
    res.status(500).json({ success: false, message: "Error creating purchase order", error: error.message });
  }
};


// ✅ Get All Purchase Orders
export const getPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find()
      .populate("supplier", "name email role")
      .populate("product", "name price");

    res.status(200).json(purchaseOrders);
  } catch (error) {
    console.error("❌ Error fetching purchase orders:", error);
    res.status(500).json({ message: "Error fetching purchase orders" });
  }
};

// ✅ Get Single Purchase Order by ID
export const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findById(id)
      .populate("supplier", "name email role")
      .populate("product", "name price");

    if (!purchaseOrder) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    res.status(200).json(purchaseOrder);
  } catch (error) {
    console.error("Error in getPurchaseOrderById:", error.message);
    res.status(500).json({ message: "Error fetching purchase order", error: error.message });
  }
};

// ✅ Update Only Purchase Order Status
export const updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("supplier", "name email role")
      .populate("product", "name price");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    res.status(200).json({
      message: "Purchase order status updated",
      updatedOrder,
    });
  } catch (error) {
    console.error("❌ Error updating purchase order status:", error);
    res.status(500).json({ message: "Error updating purchase order status" });
  }
};

// ✅ Delete Purchase Order
export const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await PurchaseOrder.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    res.status(200).json({ message: "Purchase order deleted" });
  } catch (error) {
    console.error("❌ Error deleting purchase order:", error);
    res.status(500).json({ message: "Error deleting purchase order" });
  }
};

// ✅ Generate approval token (HMAC) for secure one-click links
const generateApprovalToken = (poId) => {
  const secret = process.env.APPROVAL_SECRET || "dev-secret";
  const hmac = crypto.createHmac("sha256", secret).update(String(poId)).digest("hex");
  return hmac;
};

const verifyApprovalToken = (poId, token) => {
  const expected = generateApprovalToken(poId);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token || ""));
};

// ✅ Public approval endpoint (no auth) via signed link
export const approvePurchaseOrderViaLink = async (req, res) => {
  try {
    const { id, token } = req.params;
    if (!verifyApprovalToken(id, token)) {
      return res.status(401).send("Invalid or expired approval link");
    }

    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(
      id,
      { status: "Approved" },
      { new: true }
    ).populate("supplier", "name email").populate("product", "name");

    if (!updatedOrder) return res.status(404).send("Purchase order not found");

    // Optionally inform supplier immediately
    try {
      const supplier = updatedOrder.supplier;
      if (supplier?.email) {
        await sendPurchaseOrderEmail(
          supplier.email,
          supplier.name,
          updatedOrder.product?.name || "N/A",
          updatedOrder.quantity,
          updatedOrder.status,
          updatedOrder.expectedDate,
          updatedOrder.notes
        );
      }
    } catch (e) {
      console.error("Failed to email supplier after approval:", e?.message || e);
    }

    // Render a confirmation HTML page with toast + animation
    res.set("Content-Type", "text/html");
    res.send(`
      <html>
        <head>
          <title>PO Approved</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; padding: 24px; background: #f8fafc; }
            .card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); max-width: 640px; margin: 40px auto; }
            .title { margin: 0 0 8px; }
            .sub { color: #64748b; margin: 0 0 16px; }
            .pulse { width: 16px; height: 16px; background: #22c55e; border-radius: 9999px; position: relative; display: inline-block; margin-right: 8px; }
            .pulse::after { content: ""; position: absolute; top: -6px; left: -6px; right: -6px; bottom: -6px; border: 2px solid #86efac; border-radius: 9999px; animation: pulse 1.5s infinite; }
            @keyframes pulse { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }
            .toast { position: fixed; top: 16px; right: 16px; background: #10b981; color: #fff; padding: 12px 16px; border-radius: 8px; box-shadow: 0 6px 18px rgba(16,185,129,0.5); opacity: 0; transform: translateY(-10px); transition: all .3s ease; }
            .toast.show { opacity: 1; transform: translateY(0); }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
            .meta div { color: #0f172a; }
            .label { color: #64748b; }
          </style>
        </head>
        <body>
          <div id="toast" class="toast">Purchase Order approved and supplier notified</div>
          <div class="card">
            <h2 class="title"><span class="pulse"></span> Purchase Order Approved</h2>
            <p class="sub">Your action has been recorded successfully.</p>
            <div class="meta">
              <div><span class="label">PO ID:</span> ${updatedOrder._id}</div>
              <div><span class="label">Status:</span> ${updatedOrder.status}</div>
              <div><span class="label">Product:</span> ${updatedOrder.product?.name || "N/A"}</div>
              <div><span class="label">Quantity:</span> ${updatedOrder.quantity}</div>
              <div><span class="label">Supplier:</span> ${updatedOrder.supplier?.name || "N/A"}</div>
              <div><span class="label">Expected Delivery:</span> ${updatedOrder.expectedDate ? new Date(updatedOrder.expectedDate).toDateString() : "Not specified"}</div>
            </div>
          </div>
          <script>
            window.addEventListener('DOMContentLoaded', function(){
              const t = document.getElementById('toast');
              setTimeout(() => t.classList.add('show'), 50);
              setTimeout(() => t.classList.remove('show'), 3500);
            });
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("❌ Error in approvePurchaseOrderViaLink:", error);
    res.status(500).send("Internal server error");
  }
};

export const buildAdminPOHtml = (po, product) => {
  const approvalBaseUrl = process.env.APP_BASE_URL || "https://backend-stockai.vercel.app";
  const approvalToken = generateApprovalToken(po._id);
  const approveUrl = `${approvalBaseUrl}/api/purchase-orders/${po._id}/approve/${approvalToken}`;
  const cells = (label, value) => `
    <tr>
      <td style="padding:8px;border:1px solid #ddd"><strong>${label}</strong></td>
      <td style="padding:8px;border:1px solid #ddd">${value}</td>
    </tr>`;
  return `
    <div style="font-family:Arial,Helvetica,sans-serif">
      <h2 style="margin-bottom:12px">Auto-Created Purchase Order</h2>
      <table style="border-collapse:collapse;width:100%;max-width:640px">
        <tbody>
          ${cells("PO ID", po._id)}
          ${cells("Product", product?.name || "N/A")}
          ${cells("SKU", product?.SKU || "N/A")}
          ${cells("Quantity", po.quantity)}
          ${cells("Status", po.status)}
          ${cells("Supplier", String(po.supplier))}
          ${cells("Current Stock", product?.stockQty ?? "N/A")}
          ${cells("Min Threshold", product?.minThreshold ?? "N/A")}
          ${cells("Expected Delivery", po.expectedDate ? new Date(po.expectedDate).toDateString() : "Not specified")}
        </tbody>
      </table>
      <div style="margin-top:16px">
        <a href="${approveUrl}" target="_blank" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px">
          Approve & Email Supplier
        </a>
      </div>
      <p style="margin-top:8px;color:#6b7280;font-size:12px">If the button doesn't work, copy and paste this URL in your browser:<br/>
        <span style="word-break:break-all">${approveUrl}</span>
      </p>
    </div>
  `;
};
