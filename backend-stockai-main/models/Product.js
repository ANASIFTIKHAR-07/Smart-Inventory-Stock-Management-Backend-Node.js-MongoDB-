import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    SKU: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: { type: String },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Now references User with role="supplier"
    stockQty: { type: Number, default: 0 },
    minThreshold: { type: Number, default: 10 }, // Alert when stock is low
    maxThreshold: { type: Number, default: 100 }, // Max stock level
    unitPrice: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    reorderPoint: { type: Number, default: 15 }, // When to reorder
    reorderQuantity: { type: Number, default: 50 }, // How much to reorder
    leadTime: { type: Number, default: 7 }, // Days to receive from supplier
    demandForecast: {
      nextMonth: { type: Number, default: 0 },
      nextQuarter: { type: Number, default: 0 },
      confidence: { type: Number, default: 0.8 }, // AI confidence level
      trend: { type: String, enum: ['increasing', 'decreasing', 'stable'], default: 'stable' },
      lastUpdated: { type: Date, default: Date.now }
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Index for better query performance
productSchema.index({ category: 1, supplier: 1 });
productSchema.index({ stockQty: 1, minThreshold: 1 });
// SKU index is automatically created by unique: true constraint

export default mongoose.model("Product", productSchema);
