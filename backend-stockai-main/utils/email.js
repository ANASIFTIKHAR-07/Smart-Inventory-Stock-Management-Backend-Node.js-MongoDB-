import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const createSpinner = () => ({ start() {}, update() {}, stop() {} });

export const sendEmail = async (to, subject, text) => {
  const spinner = createSpinner();
  try {
    spinner.start();

    const info = await transporter.sendMail({
      from: `"Inventory System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: `<p>${text}</p>`,
    });

    spinner.stop();
    return true;
  } catch (error) {
    spinner.stop();
    return false;
  }
};

export const sendHtmlEmail = async (to, subject, html, textFallback = "") => {
  const spinner = createSpinner();
  try {
    spinner.start();

    const info = await transporter.sendMail({
      from: `"Inventory System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: textFallback || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      html,
    });

    spinner.stop();
    return true;
  } catch (error) {
    spinner.stop();
    return false;
  }
};

export const sendPurchaseOrderEmail = async (
  supplierEmail,
  supplierName,
  productName,
  quantity,
  status = "Pending",
  expectedDate,
  notes
) => {
  try {
    const textContent = `Dear ${supplierName},\n\nA new Purchase Order has been created.\n\nSupplier: ${supplierName} <${supplierEmail}>\nProduct: ${productName}\nQuantity: ${quantity}\nStatus: ${status}\nExpected Delivery: ${expectedDate ? new Date(expectedDate).toDateString() : "Not specified"}\n${notes ? `Notes: ${notes}\n` : ""}\nPlease confirm and process this order.\n\nBest regards,\nInventory Management System`;

    const htmlContent = `
      <h2>Dear ${supplierName},</h2>
      <p>A new <strong>Purchase Order</strong> has been created.</p>
      <table style="border-collapse:collapse;width:100%;max-width:640px">
        <tbody>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Supplier</strong></td><td style="padding:8px;border:1px solid #ddd">${supplierName} &lt;${supplierEmail}&gt;</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Product</strong></td><td style="padding:8px;border:1px solid #ddd">${productName}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Quantity</strong></td><td style="padding:8px;border:1px solid #ddd">${quantity}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Status</strong></td><td style="padding:8px;border:1px solid #ddd">${status}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Expected Delivery</strong></td><td style="padding:8px;border:1px solid #ddd">${expectedDate ? new Date(expectedDate).toDateString() : "Not specified"}</td></tr>
          ${notes ? `<tr><td style="padding:8px;border:1px solid #ddd"><strong>Notes</strong></td><td style=\"padding:8px;border:1px solid #ddd\">${notes}</td></tr>` : ""}
        </tbody>
      </table>
      <p style="margin-top:16px">Kindly confirm and process this order.</p>
      <p>Best regards,<br/>Inventory Management System</p>
    `;

    const spinner = createSpinner();
    spinner.start();

    const info = await transporter.sendMail({
      from: `"Inventory System" <${process.env.EMAIL_USER}>`,
      to: supplierEmail,
      subject: `New Purchase Order - ${productName}`,
      text: textContent,
      html: htmlContent,
    });

    spinner.stop();
    return true;
  } catch (error) {

    return false;
  }
};
