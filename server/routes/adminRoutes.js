// in server/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const csv = require('csv-parser');
const fs = require('fs');
const upload = require('../config/multerConfig');
const Task = require('../models/TaskModel');
const User = require('../models/UserModel');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// === توابع اعتبارسنجی ===
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^09\d{9}$/;
  return phoneRegex.test(phone);
};

const validateEmail = (email) => {
  if (!email) return true; // اختیاری است
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// روت آپلود (بدون تغییر)
router.post(
  '/upload',
  upload.fields([
    { name: 'audioFiles', maxCount: 200 },
    { name: 'metadata', maxCount: 1 },
  ]),
  async (req, res) => {
    if (!req.files || !req.files.metadata) {
      return res.status(400).json({ message: 'Metadata CSV file is missing.' });
    }
    const metadataFile = req.files.metadata[0];
    const results = [];
    let createdCount = 0;
    fs.createReadStream(metadataFile.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        fs.unlinkSync(metadataFile.path); 
        try {
          for (const record of results) {
            await Task.create({
              audioUrl: `/uploads/${record.audio_filename}`,
              originalText: record.transcript,
            });
            createdCount++;
          }
          res.status(201).json({ message: `${createdCount} tasks created successfully.` });
        } catch (error) {
          res.status(500).json({ message: 'Failed to create tasks from CSV.' });
        }
      });
  }
);

// @desc    Get all users (excluding admins) with their stats
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').lean(); 
    for (const user of users) {
      const annotationsCompleted = await Task.countDocuments({ annotatedBy: user._id, status: 'completed' });
      const verificationsCompleted = await Task.countDocuments({ verifiedBy: user._id });
      user.annotationsCompleted = annotationsCompleted;
      user.verificationsCompleted = verificationsCompleted;
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// روت ریست کردن آمار (بدون تغییر)
router.put('/users/reset', async (req, res) => {
  try {
    await Task.updateMany({}, { $unset: { annotatedBy: "", verifiedBy: "" } });
    res.json({ message: `Stats for all users have been reset successfully.` });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all pending annotator users
// @route   GET /api/admin/pending-users
// @access  Private/Admin
router.get('/pending-users', async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending', role: 'annotator' }).select('-password');
    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Approve a pending user
// @route   PUT /api/admin/approve-user/:id
// @access  Private/Admin
router.put('/approve-user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.status = 'active';
      await user.save();
      res.json({ message: 'User approved successfully.' });
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create a new verifier user
// @route   POST /api/admin/create-verifier
// @access  Private/Admin
router.post('/create-verifier', async (req, res) => {
  const { firstName, lastName, phoneNumber, password, email } = req.body;
  
  // اعتبارسنجی فیلدهای الزامی
  if (!firstName || !lastName || !phoneNumber || !password) {
    return res.status(400).json({ message: 'لطفا تمام فیلدهای الزامی را پر کنید.' });
  }

  // اعتبارسنجی شماره تلفن
  if (!validatePhoneNumber(phoneNumber)) {
    return res.status(400).json({ message: 'شماره تلفن باید با 09 شروع شود و دقیقاً 11 رقم باشد.' });
  }

  // اعتبارسنجی ایمیل
  if (email && !validateEmail(email)) {
    return res.status(400).json({ message: 'فرمت ایمیل صحیح نیست.' });
  }

  // اعتبارسنجی طول رمز عبور
  if (password.length < 6) {
    return res.status(400).json({ message: 'رمز عبور باید حداقل 6 کاراکتر باشد.' });
  }

  try {
    const userExists = await User.findOne({ phoneNumber });
    if (userExists) {
      return res.status(400).json({ message: 'کاربری با این شماره تلفن قبلاً وجود دارد.' });
    }
    
    const user = await User.create({
      firstName,
      lastName,
      phoneNumber,
      password,
      email,
      role: 'verifier',
      status: 'active',
      mustChangePassword: false,
    });
    
    res.status(201).json({ message: 'کاربر تاییدکننده با موفقیت ایجاد شد.' });
  } catch (error) {
    console.error('Error creating verifier:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// in server/routes/adminRoutes.js (در انتهای فایل، قبل از module.exports)

const Settings = require('../models/SettingsModel'); // ← اضافه کردن در ابتدای فایل

// @desc    Get current pricing settings
// @route   GET /api/admin/settings
// @access  Private/Admin
router.get('/settings', protect, checkRole('admin'), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // اگر Settings وجود نداشت، یکی بساز
    if (!settings) {
      settings = await Settings.create({
        annotationPrice: 700,
        verificationPrice: 700,
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

// @desc    Update pricing settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
router.put('/settings', protect, checkRole('admin'), async (req, res) => {
  const { annotationPrice, verificationPrice } = req.body;

  // اعتبارسنجی
  if (annotationPrice == null || verificationPrice == null) {
    return res.status(400).json({ message: 'لطفا هر دو قیمت را وارد کنید.' });
  }

  if (annotationPrice < 0 || verificationPrice < 0) {
    return res.status(400).json({ message: 'قیمت نمی‌تواند منفی باشد.' });
  }

  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({ annotationPrice, verificationPrice });
    } else {
      settings.annotationPrice = annotationPrice;
      settings.verificationPrice = verificationPrice;
      await settings.save();
    }
    
    res.json({ message: 'قیمت‌ها با موفقیت به‌روزرسانی شدند.', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
});

module.exports = router;