import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true},
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff", "supplier"], default: "staff" },
    supplier: {
      companyName: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String, default: "India" },
      postalCode: { type: String },
      taxId: { type: String },
      paymentTerms: { type: String, default: "Net 30" },
      rating: { type: Number, default: 5.0, min: 1, max: 5 },
      isActive: { type: Boolean, default: true },
      onTimeDelivery: { type: Number, default: 0.95 },
      qualityRating: { type: Number, default: 4.5, min: 1, max: 5 },
      avgLeadTime: { type: Number, default: 7 },
      totalOrders: { type: Number, default: 0 },
      successfulOrders: { type: Number, default: 0 }
    },
    phone: { type: String },
    address: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    profileImage: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date }
  },
  { timestamps: true }
);

userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ email: 1 });

userSchema.virtual('supplier.performanceScore').get(function () {
  if (this.role !== 'supplier' || !this.supplier) return null;
  const deliveryScore = this.supplier.onTimeDelivery * 40;
  const qualityScore = (this.supplier.qualityRating / 5) * 30;
  const reliabilityScore = this.supplier.totalOrders > 0
    ? (this.supplier.successfulOrders / this.supplier.totalOrders) * 30
    : 0;
  return Math.round((deliveryScore + qualityScore + reliabilityScore) * 100) / 100;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.model("User", userSchema);
