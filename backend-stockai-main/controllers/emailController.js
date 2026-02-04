// controllers/emailController.js
import { sendEmail, sendPurchaseOrderEmail } from "../utils/email.js";

// ✅ Generic Email Controller
export const sendEmailController = async (req, res) => {
  const { to, subject, text } = req.body;

  // Validate input
  if (!to || !subject || !text) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const success = await sendEmail(to, subject, text);

    if (success) {
      return res.json({ success: true, message: "Email sent successfully!" });
    } else {
      return res.status(500).json({ success: false, message: "Failed to send email" });
    }
  } catch (error) {
    console.error("❌ Generic email error:", error);
    return res.status(500).json({ success: false, message: "Error sending email" });
  }
};

// ✅ Purchase Order Email Controller
export const sendPurchaseOrderEmailController = async (req, res) => {
  const { supplierEmail, supplierName, productName, quantity, status, expectedDate, notes } = req.body;

  // Validate required fields
  if (!supplierEmail || !supplierName || !productName || !quantity) {
    return res.status(400).json({ success: false, message: "Required fields are missing" });
  }

  try {
    const success = await sendPurchaseOrderEmail(
      supplierEmail,
      supplierName,
      productName,
      quantity,
      status || "Pending",
      expectedDate,
      notes
    );

    if (success) {
      return res.json({ success: true, message: "Purchase order email sent successfully!" });
    } else {
      return res.status(500).json({ success: false, message: "Failed to send purchase order email" });
    }
  } catch (error) {
    console.error("❌ Purchase order email error:", error);
    return res.status(500).json({ success: false, message: "Error sending purchase order email" });
  }
};
