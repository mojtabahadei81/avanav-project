// in server/middleware/roleMiddleware.js

// Middleware برای چک کردن اینکه آیا کاربر نقش مورد نیاز را دارد یا نه
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    // کاربر از طریق middleware protect قبلاً احراز هویت شده است
    if (!req.user) {
      return res.status(401).json({ message: 'لطفاً ابتدا وارد سیستم شوید.' });
    }

    // بررسی اینکه آیا نقش کاربر در لیست نقش‌های مجاز است یا نه
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'شما اجازه دسترسی به این بخش را ندارید.' 
      });
    }

    // اگر همه چیز اوکی بود، به مرحله بعد برو
    next();
  };
};

module.exports = { checkRole };