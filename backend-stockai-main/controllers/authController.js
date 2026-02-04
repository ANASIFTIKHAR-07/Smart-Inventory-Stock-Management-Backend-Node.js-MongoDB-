import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendHtmlEmail } from "../utils/email.js";

// Signup (Admin/Staff)
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role && !["admin", "staff"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'admin' or 'staff'" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "staff",
    });
    await newUser.save();

    const response = newUser.toObject();
    delete response.password;

    res.status(201).json({
      message: "User created successfully",
      user: response,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // Supplier Signup
// export const supplierSignup = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       companyName,
//       phone,
//       address,
//       city,
//       state,
//       country,
//       postalCode,
//       taxId,
//       paymentTerms,
//     } = req.body;

//     if (!name || !email || !password || !companyName) {
//       return res.status(400).json({
//         message: "Name, email, password, and company name are required",
//       });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User with this email already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newSupplier = new User({
//       name,
//       email,
//       password: hashedPassword,
//       role: "supplier",
//       supplier: {
//         companyName,
//         phone,
//         address,
//         city,
//         state,
//         country: country || "India",
//         postalCode,
//         taxId,
//         paymentTerms: paymentTerms || "Net 30",
//       },
//     });

//     await newSupplier.save();

//     const response = newSupplier.toObject();
//     delete response.password;

//     res.status(201).json({
//       message: "Supplier registered successfully",
//       supplier: response,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated. Please contact administrator." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const response = user.toObject();
    delete response.password;

    res.json({
      message: "Login successful",
      token,
      user: response,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Profile
export const getProfile = async (req, res) => {
  try {
    res.json({ message: "Profile endpoint - requires authentication" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash token and set to resetPasswordToken field
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    // Set token and expiration (15 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password/${resetToken}`;

    // Email content
    const htmlContent = `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>You have requested to reset your password. Please click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 15 minutes.</p>
      <p>If you did not request this password reset, please ignore this email.</p>
      <p>Best regards,<br/>SmartStock AI Team</p>
    `;

    const textContent = `Hello ${user.name},\n\nYou have requested to reset your password. Please visit the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you did not request this password reset, please ignore this email.\n\nBest regards,\nSmartStock AI Team`;

    // Send email
    const emailSent = await sendHtmlEmail(
      user.email,
      "Password Reset Request - SmartStock AI",
      htmlContent,
      textContent
    );

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send reset email" });
    }

    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Validate Reset Token
export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token from URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token and valid expiration
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    res.json({ message: "Token is valid" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Hash the token from URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching token and valid expiration
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
