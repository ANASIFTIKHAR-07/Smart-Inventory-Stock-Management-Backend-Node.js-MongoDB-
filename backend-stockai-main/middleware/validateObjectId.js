import mongoose from "mongoose";

/**
 * Middleware to validate MongoDB ObjectId in route parameters
 * @param {...string} paramNames - Names of parameters to validate (e.g. 'id', 'productId')
 * @returns Express middleware function
 * 
 * Usage:
 * router.get('/:id', validateObjectId('id'), controller);
 * router.get('/:productId', validateObjectId('productId'), controller);
 */
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
