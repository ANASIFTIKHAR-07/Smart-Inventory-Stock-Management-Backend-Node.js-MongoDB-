// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

/** Require valid JWT; sets req.user = { id, role } */
export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

/**
 * Require user role to be one of the allowed roles.
 * Use after protect(). Returns 403 if role not allowed.
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'staff')
 */
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: "Access denied. Your role does not have permission for this action.",
    });
  }
  next();
};
