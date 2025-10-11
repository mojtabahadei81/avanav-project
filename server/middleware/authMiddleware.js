const jwt = require('jsonwebtoken');
const User = require('../models/UserModel.js');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // دریافت توکن از هدر: 'Bearer TOKEN_STRING'
      token = req.headers.authorization.split(' ')[1];

      // اعتبارسنجی توکن
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // پیدا کردن کاربر با ID موجود در توکن و اضافه کردن آن به آبجکت request
      req.user = await User.findById(decoded.id).select('-password');

      next(); // برو به مرحله بعد (روت اصلی)
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };