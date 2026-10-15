const jwt = require('jsonwebtoken');
const authCookieOptions = require('./cookieOptions');

const generateTokenAndSetCookie = (res, customerId) => {
  const token = jwt.sign({ id: customerId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    ...authCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

module.exports = generateTokenAndSetCookie;
