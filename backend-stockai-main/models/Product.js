import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    SKU: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: { type: String },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stockQty: { type: Number, default: 0 },
    minThreshold: { type: Number, default: 10 },
    maxThreshold: { type: Number, default: 100 },
    unitPrice: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    reorderPoint: { type: Number, default: 15 },
    reorderQuantity: { type: Number, default: 50 },
    leadTime: { type: Number, default: 7 },
    demandForecast: {
      nextMonth: { type: Number, default: 0 },
      nextQuarter: { type: Number, default: 0 },
      confidence: { type: Number, default: 0.8 },
      trend: { type: String, enum: ['increasing', 'decreasing', 'stable'], default: 'stable' },
      lastUpdated: { type: Date, default: Date.now }
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ category: 1, supplier: 1 });
productSchema.index({ stockQty: 1, minThreshold: 1 });

export default mongoose.model("Product", productSchema);
