const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const loadCustomer = async (userId) => {
  const customer = await Customer.findById(userId);
  if (!customer) {
    return null;
  }
  if (!Array.isArray(customer.wishlist)) {
    customer.wishlist = [];
  }
  return customer;
};

const hasProduct = (wishlist, productId) =>
  wishlist.some((id) => id.toString() === productId);

const validateProductId = (productId) => mongoose.Types.ObjectId.isValid(productId);

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!validateProductId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      });
    }

    const product = await Product.findById(productId).select('_id');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const customer = await loadCustomer(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, customer not found',
      });
    }

    if (hasProduct(customer.wishlist, productId)) {
      return res.status(409).json({
        success: false,
        message: 'Product is already in the wishlist.',
      });
    }

    customer.wishlist.push(productId);
    await customer.save();

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name price category image stock',
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, customer not found',
      });
    }

    const wishlist = (customer.wishlist || []).filter(Boolean);

    return res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!validateProductId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      });
    }

    const customer = await loadCustomer(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, customer not found',
      });
    }

    if (!hasProduct(customer.wishlist, productId)) {
      return res.status(404).json({
        success: false,
        message: 'Product is not in the wishlist.',
      });
    }

    customer.wishlist = customer.wishlist.filter((id) => id.toString() !== productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!validateProductId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.',
      });
    }

    const product = await Product.findById(productId).select('_id');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const customer = await loadCustomer(req.user._id);
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, customer not found',
      });
    }

    const alreadySaved = hasProduct(customer.wishlist, productId);
    if (alreadySaved) {
      customer.wishlist = customer.wishlist.filter((id) => id.toString() !== productId);
    } else {
      customer.wishlist.push(productId);
    }
    await customer.save();

    return res.status(200).json({
      success: true,
      saved: !alreadySaved,
      message: alreadySaved ? 'Product removed from wishlist' : 'Product added to wishlist',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
