// in server/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const Task = require('../models/TaskModel'); // <-- 1. مدل Task را ایمپورت می‌کنیم
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware'); // <-- 2. میدل‌ور protect را ایمپورت می‌کنیم

// تابع کمکی برای تولید توکن
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
router.post('/register', async (req, res) => {
  // ... (کد ثبت‌نام شما بدون تغییر باقی می‌ماند)
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const user = await User.create({
      name,
      email,
      password,
      isAdmin: isFirstAccount,
    });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
router.post('/login', async (req, res) => {
  // ... (کد ورود شما بدون تغییر باقی می‌ماند)
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});


// --- START: روت جدید برای آمار کاربر ---

// @desc    Get stats for the logged-in user
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id; // ID کاربر از میدل‌ور protect می‌آید

    // 1. شمارش تسک‌های اصلاح شده موفق توسط این کاربر
    const annotationsCompleted = await Task.countDocuments({
      annotatedBy: userId,
      status: 'completed', // فقط تسک‌هایی که نهایتا تایید شده‌اند
    });

    // 2. شمارش تسک‌های تایید شده موفق توسط این کاربر
    const verificationsCompleted = await Task.countDocuments({
      verifiedBy: userId, // اینجا نیازی به چک کردن status نیست چون verifiedBy فقط برای completed ها ثبت می‌شود
    });

    // 3. ارسال نتیجه به فرانت‌اند
    res.json({
      annotationsCompleted,
      verificationsCompleted,
    });
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// --- END: پایان روت جدید ---


module.exports = router;