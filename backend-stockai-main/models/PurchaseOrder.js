// models/PurchaseOrder.js
import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Now references User with role="supplier"
      required: true,
    },
    quantity: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Cancelled"],
      default: "Pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // the staff/admin who created the PO
      required: true,
    },
    expectedDate: { type: Date }, // when supplier is expected to deliver
    receivedDate: { type: Date }, // when actually delivered
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);
