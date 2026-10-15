const crypto = require('crypto');
const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const getRazorpay = require('../config/razorpay');

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

const validateShippingAddress = (address = {}) => {
  const shippingAddress = {
    fullName: clean(address.fullName),
    phone: clean(address.phone),
    addressLine1: clean(address.addressLine1),
    city: clean(address.city),
    state: clean(address.state),
    pincode: clean(address.pincode),
  };

  if (!shippingAddress.fullName) {
    return { message: 'Full name is required.' };
  }
  if (!/^\d{10}$/.test(shippingAddress.phone)) {
    return { message: 'Phone must be a 10 digit number.' };
  }
  if (!shippingAddress.addressLine1) {
    return { message: 'Address is required.' };
  }
  if (!shippingAddress.city) {
    return { message: 'City is required.' };
  }
  if (!shippingAddress.state) {
    return { message: 'State is required.' };
  }
  if (!/^\d{6}$/.test(shippingAddress.pincode)) {
    return { message: 'Pincode must contain 6 digits.' };
  }

  return { shippingAddress };
};

const createPaymentOrder = async (req, res) => {
  try {
    const { message, shippingAddress } = validateShippingAddress(req.body.shippingAddress);
    if (message) {
      return res.status(400).json({ success: false, message });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(401).json({ success: false, message: 'Not authorized, customer not found' });
    }

    const cart = Array.isArray(customer.cart) ? customer.cart : [];
    if (cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    const items = [];
    let totalAmount = 0;

    for (const cartItem of cart) {
      const product = await Product.findById(cartItem.product).select('name price image stock');
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'A product in your cart is no longer available.',
        });
      }
      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}.`,
        });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });
      totalAmount += product.price * cartItem.quantity;
    }

    const razorpay = getRazorpay();
    const order = await Order.create({
      user: customer._id,
      items,
      shippingAddress,
      totalAmount,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT',
    });
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: order._id.toString(),
      });
    } catch (razorpayError) {
      await Order.findByIdAndDelete(order._id);
      throw razorpayError;
    }

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID.' });
    }
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment details are required.' });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot access this order.' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({ success: true, order });
    }

    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Payment does not match this order.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(String(razorpay_signature));
    const signatureMatches =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!signatureMatches) {
      order.paymentStatus = 'FAILED';
      await order.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    await Customer.findByIdAndUpdate(req.user._id, { cart: [] });

    return res.status(200).json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot access this order.' });
    }

    return res.status(200).json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const nextStatus = {
  PLACED: 'CONFIRMED',
  CONFIRMED: 'SHIPPED',
  SHIPPED: 'DELIVERED',
};

const updateOrderStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot access this order.' });
    }

    const upcoming = nextStatus[order.status];
    if (!upcoming) {
      return res.status(400).json({
        success: false,
        message: 'This order cannot move to the next status.',
      });
    }

    order.status = upcoming;
    await order.save();
    return res.status(200).json({ success: true, order });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
