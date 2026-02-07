import User from "../models/User.js";
import StockMovement from "../models/StockMovement.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import bcrypt from "bcrypt";

export const createSupplier = async (req, res) => {
  try {
    const { name, email, password, companyName, phone, address, city, state, country, postalCode, taxId, paymentTerms } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const tempPassword = password || `${Math.random().toString(36).slice(-10)}Aa1!`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const supplierUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "supplier",
      supplier: {
        companyName,
        phone,
        address,
        city,
        state,
        country: country || "India",
        postalCode,
        taxId,
        paymentTerms: paymentTerms || "Net 30",
      },
    });

    await supplierUser.save();

    const response = supplierUser.toObject();
    delete response.password;

    res.status(201).json({
      message: "Supplier created successfully",
      supplier: response,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await User.find({ role: "supplier" })
      .select("-password")
      .populate("supplier");
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const supplier = await User.findOne({ _id: req.params.id, role: "supplier" })
      .select("-password")
      .populate("supplier");

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { name, email, companyName, phone, address, city, state, country, postalCode, taxId, paymentTerms, rating, isActive } = req.body;

    const updateData = {
      name,
      email,
      supplier: {
        companyName,
        phone,
        address,
        city,
        state,
        country,
        postalCode,
        taxId,
        paymentTerms,
        rating,
        isActive,
      },
    };

    const supplier = await User.findOneAndUpdate(
      { _id: req.params.id, role: "supplier" },
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json({
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deactivateSupplier = async (req, res) => {
  try {
    const supplier = await User.findOneAndUpdate(
      { _id: req.params.id, role: "supplier" },
      { isActive: false },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json({ message: "Supplier deactivated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSupplierPerformance = async (req, res) => {
  try {
    const supplier = await User.findOne({ _id: req.params.id, role: "supplier" })
      .select("supplier");

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const performance = {
      onTimeDelivery: supplier.supplier.onTimeDelivery,
      qualityRating: supplier.supplier.qualityRating,
      avgLeadTime: supplier.supplier.avgLeadTime,
      totalOrders: supplier.supplier.totalOrders,
      successfulOrders: supplier.supplier.successfulOrders,
      performanceScore: supplier.supplier.performanceScore,
    };

    res.json(performance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSuppliersPerformance = async (req, res) => {
  try {
    const performanceData = await PurchaseOrder.aggregate([
      {
        $lookup: {
          from: "stockmovements",
          localField: "supplier", // match supplier from PurchaseOrder
          foreignField: "supplierId", // supplierId in StockMovement
          as: "deliveries"
        }
      },
      { $unwind: { path: "$deliveries", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          deliveryDays: {
            $cond: [
              { $and: ["$deliveries.movementDate", "$createdAt"] },
              {
                $divide: [
                  { $subtract: ["$deliveries.movementDate", "$createdAt"] },
                  1000 * 60 * 60 * 24
                ]
              },
              null
            ]
          },
          onTime: {
            $cond: [
              { $lte: ["$deliveries.movementDate", "$expectedDate"] },
              1,
              0
            ]
          }
        }
      },
      {
        $group: {
          _id: "$supplier",
          totalOrders: { $sum: 1 },
          totalDeliveries: {
            $sum: {
              $cond: [{ $ifNull: ["$deliveries", false] }, 1, 0]
            }
          },
          onTimeDeliveries: { $sum: "$onTime" },
          avgDeliveryDays: { $avg: "$deliveryDays" }
        }
      },
      {
        $addFields: {
          performancePercentage: {
            $cond: [
              { $eq: ["$totalDeliveries", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$onTimeDeliveries", "$totalDeliveries"] },
                  100
                ]
              }
            ]
          },
          performanceStatus: {
            $switch: {
              branches: [
                { case: { $gte: ["$performancePercentage", 90] }, then: "Excellent" },
                { case: { $gte: ["$performancePercentage", 75] }, then: "Good" },
                { case: { $gte: ["$performancePercentage", 50] }, then: "Average" }
              ],
              default: "Poor"
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "supplierDetails"
        }
      },
      {
        $unwind: {
          path: "$supplierDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          supplierName: "$supplierDetails.name",
          email: "$supplierDetails.email",
          totalOrders: 1,
          totalDeliveries: 1,
          onTimeDeliveries: 1,
          avgDeliveryDays: { $round: ["$avgDeliveryDays", 1] },
          performancePercentage: { $round: ["$performancePercentage", 1] },
          performanceStatus: 1
        }
      }
    ]);

    res.status(200).json(performanceData);
  } catch (error) {
    console.error("Error calculating supplier performance:", error);
    res.status(500).json({ message: "Error calculating performance", error });
  }
};

