// in server/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const Task = require('../models/TaskModel');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');
const Settings = require('../models/SettingsModel'); // ← اضافه کردن در ابتدای فایل


// تابع کمکی برای تولید توکن
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// === توابع اعتبارسنجی ===
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^09\d{9}$/;
  return phoneRegex.test(phone);
};

const validateEmail = (email) => {
  if (!email) return true; // ایمیل اختیاری است
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// @desc    Register a new ANNOTATOR user (awaiting approval)
// @route   POST /api/users/register
router.post('/register', async (req, res) => {
  const { firstName, lastName, phoneNumber, email } = req.body;
  
  // اعتبارسنجی فیلدهای الزامی
  if (!firstName || !lastName || !phoneNumber) {
    return res.status(400).json({ message: 'نام، نام خانوادگی و شماره تلفن اجباری هستند.' });
  }

  // اعتبارسنجی فرمت شماره تلفن
  if (!validatePhoneNumber(phoneNumber)) {
    return res.status(400).json({ message: 'شماره تلفن باید با 09 شروع شود و دقیقاً 11 رقم باشد.' });
  }

  // اعتبارسنجی ایمیل (اگر وارد شده باشد)
  if (email && !validateEmail(email)) {
    return res.status(400).json({ message: 'فرمت ایمیل صحیح نیست.' });
  }

  try {
    const userExists = await User.findOne({ phoneNumber });
    if (userExists) {
      return res.status(400).json({ message: 'کاربری با این شماره تلفن قبلاً ثبت‌نام کرده است.' });
    }
    
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'کاربری با این ایمیل قبلاً ثبت‌نام کرده است.' });
      }
    }
    
    const user = await User.create({
      firstName, 
      lastName, 
      phoneNumber, 
      email,
      password: phoneNumber,
      role: 'annotator',
      status: 'pending',
      mustChangePassword: true,
    });
    
    if (user) {
      res.status(201).json({
        message: 'ثبت‌نام شما با موفقیت انجام شد. نام کاربری و رمز عبور اولیه شما، شماره تلفن شماست. لطفاً منتظر تایید مدیر سیستم بمانید.'
      });
    } else {
      res.status(400).json({ message: 'اطلاعات وارد شده نامعتبر است.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
router.post('/login', async (req, res) => {
  const { phoneNumber, password } = req.body;

  // اعتبارسنجی ورودی
  if (!phoneNumber || !password) {
    return res.status(400).json({ message: 'لطفا شماره تلفن و رمز عبور را وارد کنید.' });
  }

  if (!validatePhoneNumber(phoneNumber)) {
    return res.status(400).json({ message: 'فرمت شماره تلفن صحیح نیست.' });
  }

  try {
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return res.status(401).json({ message: 'شماره تلفن یا رمز عبور نامعتبر است.' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ message: 'حساب کاربری شما هنوز توسط مدیر سیستم تایید نشده است.' });
    }

    if (await user.matchPassword(password)) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'شماره تلفن یا رمز عبور نامعتبر است.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// @desc    Get stats for the logged-in user
// @route   GET /api/users/stats
// @access  Private
// @desc    Get stats for the logged-in user
// @route   GET /api/users/stats
// @access  Private
// فایل: server/routes/userRoutes.js

router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let annotationsCompleted = 0;
    let verificationsCompleted = 0;

    if (userRole === 'annotator') {
      // ✅✅✅ کد اصلاح شده (صحیح) ✅✅✅
      // تسک‌هایی را بشمار که توسط این کاربر اصلاح شده و منتظر تایید هستند یا تایید شده‌اند
      annotationsCompleted = await Task.countDocuments({
        annotatedBy: userId,
        status: { $in: ['pending_verification', 'completed'] }
      });
      verificationsCompleted = 0;
    } else if (userRole === 'verifier') {
      // این بخش بدون تغییر باقی می‌ماند
      annotationsCompleted = 0;
      verificationsCompleted = await Task.countDocuments({
        verifiedBy: userId,
        status: 'completed', // تاییدکننده فقط کارهای تکمیل شده خودش را می‌بیند
      });
    } else if (userRole === 'admin') {
      // ادمین هم باید منطق جدید را داشته باشد
      annotationsCompleted = await Task.countDocuments({
        annotatedBy: userId,
        status: { $in: ['pending_verification', 'completed'] }
      });
      verificationsCompleted = await Task.countDocuments({
        verifiedBy: userId,
        status: 'completed',
      });
    }

    // === محاسبه درآمد (این بخش بدون تغییر کار می‌کند) ===
    let settings = await Settings.findOne();
    if (!settings) {
      settings = { annotationPrice: 700, verificationPrice: 700 };
    }

    const estimatedEarnings =
      (annotationsCompleted * settings.annotationPrice) +
      (verificationsCompleted * settings.verificationPrice);

    res.json({
      annotationsCompleted,
      verificationsCompleted,
      estimatedEarnings,
      userRole,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // اعتبارسنجی ورودی
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'لطفا رمز عبور فعلی و جدید را وارد کنید.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'رمز عبور جدید باید حداقل 6 کاراکتر باشد.' });
  }

  try {
    const user = await User.findById(req.user._id);
    
    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      user.mustChangePassword = false;
      await user.save();
      res.json({ message: 'رمز عبور با موفقیت تغییر کرد.' });
    } else {
      res.status(401).json({ message: 'رمز عبور فعلی نامعتبر است.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

module.exports = router;