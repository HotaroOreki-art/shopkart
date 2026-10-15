const bcrypt = require('bcrypt');
const Customer = require('../models/customer.model');
const generateTokenAndSetCookie = require('../utils/generateToken');
const authCookieOptions = require('../utils/cookieOptions');

// Task 1: Register Customer
const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // 1. Mandatory field checks -> 400 Bad Request
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields (fullName, email, password, phone) are required.',
      });
    }

    // 2. Password length validation -> 400 Bad Request
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters.',
      });
    }

    // 3. Check for existing email -> 409 Conflict
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists.',
      });
    }

    // 4. Hash password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create customer in DB
    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });

    // 6. Return response omitting password
    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Task 2: Login Customer
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email });
    if (!customer) {
      // Generic error message to prevent account enumeration
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare plaintext password with hashed password in DB
    const isPasswordMatch = await bcrypt.compare(password, customer.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT and set HttpOnly cookie
    generateTokenAndSetCookie(res, customer._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Task 3: Get Authenticated Profile
const getMyProfile = async (req, res) => {
  try {
    // req.user was attached by protect middleware and has password excluded
    return res.status(200).json(req.user);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Task 4: Logout
const logoutCustomer = async (req, res) => {
  try {
    // Clear cookie by overwriting it with empty string and immediate expiration
    res.cookie('token', '', {
      ...authCookieOptions(),
      expires: new Date(0),
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Bonus: Change Password (+10 Marks)
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both oldPassword and newPassword are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    // Fetch user with password field since req.user omitted it
    const customer = await Customer.findById(req.user._id);

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, customer.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // Hash new password and save
    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(newPassword, salt);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword,
};