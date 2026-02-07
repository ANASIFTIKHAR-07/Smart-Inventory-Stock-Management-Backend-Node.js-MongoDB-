import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    movementType: {
      type: String,
      enum: ["IN", "OUT", "adjustment", "return", "damage"],
      required: true
    },
    quantity: { type: Number, required: true },
    remarks: { type: String }, 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 

    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    previousStock: { type: Number },
    newStock: { type: Number },
    reference: { type: String }, 
    unitPrice: { type: Number }, 
    totalValue: { type: Number }, 
    customer: { type: String }, 
    notes: { type: String },
    movementDate: { type: Date, default: Date.now },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

stockMovementSchema.index({ product: 1, movementType: 1, createdAt: -1 });
stockMovementSchema.index({ createdAt: -1 });

export default mongoose.model("StockMovement", stockMovementSchema);
