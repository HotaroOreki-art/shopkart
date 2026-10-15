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
  if (!Array.isArray(customer.cart)) {
    customer.cart = [];
  }
  return customer;
};

const findCartItem = (cart, productId) =>
  cart.find((item) => item.product.toString() === productId);

const populatedCart = async (customer) => {
  await customer.populate({
    path: 'cart.product',
    select: 'name price image stock category',
  });
  return (customer.cart || []).filter((item) => item.product);
};

const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const product = await Product.findById(productId).select('stock');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const customer = await loadCustomer(req.user._id);
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Not authorized, customer not found' });
    }

    const existing = findCartItem(customer.cart, productId);
    const nextQuantity = existing ? existing.quantity + 1 : 1;

    if (nextQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Quantity exceeds available stock.',
      });
    }

    if (existing) {
      existing.quantity = nextQuantity;
    } else {
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();
    const cart = await populatedCart(customer);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Not authorized, customer not found' });
    }
    if (!Array.isArray(customer.cart)) {
      customer.cart = [];
    }

    const cart = await populatedCart(customer);
    return res.status(200).json({ success: true, cart });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const quantity = Number(req.body.quantity);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1.',
      });
    }

    const product = await Product.findById(productId).select('stock');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Quantity exceeds available stock.',
      });
    }

    const customer = await loadCustomer(req.user._id);
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Not authorized, customer not found' });
    }

    const existing = findCartItem(customer.cart, productId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product is not in the cart.' });
    }

    existing.quantity = quantity;
    await customer.save();
    const cart = await populatedCart(customer);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const customer = await loadCustomer(req.user._id);
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Not authorized, customer not found' });
    }

    const existing = findCartItem(customer.cart, productId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product is not in the cart.' });
    }

    customer.cart = customer.cart.filter((item) => item.product.toString() !== productId);
    await customer.save();
    const cart = await populatedCart(customer);

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
};
