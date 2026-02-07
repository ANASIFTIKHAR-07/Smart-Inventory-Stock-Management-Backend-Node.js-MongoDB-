import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Cancelled"], default: "Pending" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expectedDate: { type: Date },
    receivedDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);
