// server/routes/adminRoutes.js (نسخه نهایی و کامل)

const express = require('express');
const router = express.Router();
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const upload = require('../config/multerConfig');
const Task = require('../models/TaskModel');
const User = require('../models/UserModel');
const Settings = require('../models/SettingsModel');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// === توابع اعتبارسنجی (بدون تغییر) ===
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^09\d{9}$/;
  return phoneRegex.test(phone);
};

const validateEmail = (email) => {
  if (!email) return true; // اختیاری است
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ⬇️⬇️⬇️ بخش آپلود با منطق جدید جایگزین شده است ⬇️⬇️⬇️

// @desc    Upload audio files and metadata (CSV or JSON) to create tasks
// @route   POST /api/admin/upload
// @access  Private/Admin
router.post(
  '/upload',
  upload.fields([
    { name: 'audioFiles', maxCount: 200 },
    { name: 'metadata', maxCount: 1 },
  ]),
  async (req, res) => {
    if (!req.files || !req.files.metadata || !req.files.audioFiles) {
      return res.status(400).json({ message: 'لطفا هم فایل‌های صوتی و هم فایل متادیتا را انتخاب کنید.' });
    }

    const metadataFile = req.files.metadata[0];
    const audioFiles = req.files.audioFiles;
    const fileExtension = path.extname(metadataFile.originalname).toLowerCase();

    try {
      if (fileExtension === '.csv') {
        await processCsvUpload(metadataFile, audioFiles, res);
      } else if (fileExtension === '.json') {
        await processJsonUpload(metadataFile, audioFiles, res);
      } else {
        fs.unlinkSync(metadataFile.path); 
        return res.status(400).json({ message: 'فرمت فایل متادیتا پشتیبانی نمی‌شود. لطفا از .csv یا .json استفاده کنید.' });
      }
    } catch (error) {
      console.error('Upload processing error:', error);
      fs.unlinkSync(metadataFile.path);
      return res.status(500).json({ message: 'خطایی در پردازش فایل‌ها رخ داد.' });
    }
  }
);

// --- تابع کمکی برای پردازش فایل CSV ---
const processCsvUpload = (metadataFile, audioFiles, res) => {
  const results = [];
  fs.createReadStream(metadataFile.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      fs.unlinkSync(metadataFile.path); 
      const metadataMap = new Map();
      results.forEach(record => {
        if (record.audio_filename) {
          metadataMap.set(record.audio_filename, record);
        }
      });
      createTasksFromMetadata(metadataMap, audioFiles, 'transcript', res, 'audio_filename');
    })
    .on('error', (error) => {
      fs.unlinkSync(metadataFile.path);
      console.error('CSV parsing error:', error);
      res.status(400).json({ message: 'فایل CSV نامعتبر است یا هدرهای لازم را ندارد.' });
    });
};

// --- تابع کمکی برای پردازش فایل JSON ---
const processJsonUpload = async (metadataFile, audioFiles, res) => {
  const results = [];
  const fileStream = fs.createReadStream(metadataFile.path);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    try {
      if (line.trim()) results.push(JSON.parse(line));
    } catch (e) {
      fs.unlinkSync(metadataFile.path);
      return res.status(400).json({ message: 'فایل JSON معتبر نیست. هر خط باید یک آبجکت JSON کامل باشد.' });
    }
  }

  fs.unlinkSync(metadataFile.path);
  const metadataMap = new Map();
  results.forEach(record => {
    if (record.chunk_name) {
      metadataMap.set(record.chunk_name, record);
    }
  });
  await createTasksFromMetadata(metadataMap, audioFiles, 'transcript_full', res, 'chunk_name');
};

// --- تابع اصلی و مشترک برای ساخت تسک‌ها ---
const createTasksFromMetadata = async (metadataMap, audioFiles, transcriptKey, res, filenameKey) => {
  const unmatchedAudioFiles = [];
  
  for (const audioFile of audioFiles) {
    if (!metadataMap.has(audioFile.originalname)) {
      unmatchedAudioFiles.push(audioFile.originalname);
    }
  }

  if (unmatchedAudioFiles.length > 0) {
    const errorMessage = `برای فایل‌های صوتی زیر اطلاعاتی در متادیتا یافت نشد: ${unmatchedAudioFiles.join(', ')}`;
    return res.status(400).json({ message: errorMessage });
  }

  const tasksToCreate = audioFiles
    .filter(audioFile => metadataMap.has(audioFile.originalname)) // فیلتر کردن فایل‌هایی که متادیتا دارند
    .map(audioFile => {
      const metadata = metadataMap.get(audioFile.originalname);
      return {
        audioUrl: `/uploads/${audioFile.originalname}`,
        originalText: metadata[transcriptKey],
      };
    });

  if (tasksToCreate.length === 0 && audioFiles.length > 0) {
      return res.status(400).json({ message: `هیچ یک از نام فایل‌های صوتی آپلود شده با نام فایل‌ها در متادیتای ${filenameKey} مطابقت نداشت.` });
  }

  try {
    if (tasksToCreate.length > 0) {
      await Task.insertMany(tasksToCreate);
    }
    res.status(201).json({ message: ` .تسک با موفقیت ایجاد شد ${tasksToCreate.length}` });
  } catch (error) {
    console.error('Error creating tasks:', error);
    res.status(500).json({ message: 'خطا در ذخیره تسک‌ها در دیتابیس.' });
  }
};

// ⬆️⬆️⬆️ پایان بخش جدید آپلود ⬆️⬆️⬆️


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
  
  if (!firstName || !lastName || !phoneNumber || !password) {
    return res.status(400).json({ message: 'لطفا تمام فیلدهای الزامی را پر کنید.' });
  }

  if (!validatePhoneNumber(phoneNumber)) {
    return res.status(400).json({ message: 'شماره تلفن باید با 09 شروع شود و دقیقاً 11 رقم باشد.' });
  }

  if (email && !validateEmail(email)) {
    return res.status(400).json({ message: 'فرمت ایمیل صحیح نیست.' });
  }

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

// @desc    Get current pricing settings
// @route   GET /api/admin/settings
// @access  Private/Admin
router.get('/settings', protect, checkRole('admin'), async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
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