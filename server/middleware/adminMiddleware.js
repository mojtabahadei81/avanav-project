// in middleware/adminMiddleware.js

const admin = (req, res, next) => {
  // اینجا req.user از میدل‌ور protect می‌آید
  if (req.user && req.user.role === 'admin') {
    next(); // اگر کاربر ادمین بود، به مرحله بعد برو
  } else {
    res.status(403).json({ message: 'Not authorized as an admin.' });
  }
};

module.exports = { admin };