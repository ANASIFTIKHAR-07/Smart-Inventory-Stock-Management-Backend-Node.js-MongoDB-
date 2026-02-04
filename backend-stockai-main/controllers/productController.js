import Product from "../models/Product.js";
import User from "../models/User.js"; // ✅ fix here
import { sendEmail } from "../utils/email.js";

// Create Product
export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    // find user by ID
    const foundUser = await User.findById(product.user);

    if (foundUser && foundUser.email) {
      await sendEmail(
        foundUser.email,
        "New Product Added",
        `Dear ${foundUser.name},\n\nA new product "${product.name}" (SKU: ${product.sku}) has been added to the inventory and linked to you.\n\nRegards,\nInventory System`
      );
    }

    res.json({ msg: "Product created & email sent", product });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


// Get All Products (with supplier info)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("supplier", "name email role");
    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get Single Product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("supplier", "name email role");
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Product deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
