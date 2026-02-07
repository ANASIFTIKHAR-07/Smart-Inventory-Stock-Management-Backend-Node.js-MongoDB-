import mongoose from "mongoose";

export const validateObjectId = (...paramNames) => {
  return (req, res, next) => {
    for (const paramName of paramNames) {
      const value = req.params[paramName];
      
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${paramName} format. Must be a valid MongoDB ObjectId.`,
        });
      }
    }
    next();
  };
};
