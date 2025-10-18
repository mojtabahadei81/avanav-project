const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const Task = require('./models/TaskModel');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const { protect } = require('./middleware/authMiddleware');
const { admin } = require('./middleware/adminMiddleware');
const { checkRole } = require('./middleware/roleMiddleware'); // ← اضافه شد

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/api/users', userRoutes);
app.use('/api/admin', protect, admin, adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API is running...');
});

// @desc    Get the next available task based on mode (annotation or verification)
// @route   GET /api/tasks/next?mode=annotation|verification
// @access  Private
app.get('/api/tasks/next', protect, async (req, res) => {
  try {
    const { mode } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;

    // === چک امنیتی: بررسی role کاربر ===
    if (mode === 'annotation') {
      // فقط annotator یا admin می‌توانند تسک اصلاح دریافت کنند
      if (userRole === 'verifier') {
        return res.status(403).json({
          message: 'شما به عنوان تاییدکننده نمی‌توانید تسک اصلاح دریافت کنید.',
        });
      }

      const task = await Task.findOneAndUpdate(
        { status: 'pending_annotation' },
        { status: 'in_progress', annotatedBy: userId },
        { new: true }
      );

      if (!task) {
        return res.status(404).json({ message: 'No available annotation tasks at the moment.' });
      }
      res.json(task);

    } else if (mode === 'verification') {
      // فقط verifier یا admin می‌توانند تسک تایید دریافت کنند
      if (userRole === 'annotator') {
        return res.status(403).json({
          message: 'شما به عنوان اصلاح‌کننده نمی‌توانید تسک تایید دریافت کنید.',
        });
      }

      const task = await Task.findOne({
        status: 'pending_verification',
        annotatedBy: { $ne: userId },
      });

      if (!task) {
        return res.status(404).json({ message: 'No available verification tasks for you at the moment.' });
      }
      res.json(task);

    } else {
      return res.status(400).json({ message: 'Invalid or missing mode parameter.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a task with correction data
// @route   PUT /api/tasks/:id
// @access  Private (فقط annotator و admin)
// @desc    Update a task with correction data
// @route   PUT /api/tasks/:id
// @access  Private (فقط annotator و admin)
// فایل: server.js

// ... کد های قبلی

app.put('/api/tasks/:id', protect, checkRole('annotator', 'admin'), async (req, res) => {
  try {
    // ✅ تمام فیلدها از جمله تگ‌های جدید را دریافت می‌کنیم
    const {
      correctedText,
      gender,
      ageRange,
      dialect,
      emotion,
      backgroundNoise,
      profanity,
    } = req.body;
    
    const taskId = req.params.id;

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        correctedText,
        gender,
        ageRange,
        // ✅ تگ‌های جدید را برای ذخیره شدن اضافه می‌کنیم
        dialect,
        emotion,
        backgroundNoise,
        profanity,
        status: 'pending_verification',
      },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Verify (approve/reject) a task
// @route   POST /api/tasks/:id/verify
// @access  Private (فقط verifier و admin)
app.post('/api/tasks/:id/verify', protect, checkRole('verifier', 'admin'), async (req, res) => {
  try {
    const { action } = req.body;
    const taskId = req.params.id;
    const verifierId = req.user._id;

    let updateData;

    if (action === 'approve') {
      updateData = { status: 'completed', verifiedBy: verifierId };
    } else if (action === 'reject') {
      // ✅ هنگام رد کردن، تگ‌های جدید هم پاک می‌شوند
      updateData = {
        status: 'pending_annotation',
        correctedText: '',
        gender: '',
        ageRange: '',
        dialect: '',
        emotion: '',
        backgroundNoise: '',
        profanity: '',
        annotatedBy: null,
      };
    } else {
      return res.status(400).json({ message: 'Invalid action.' });
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json({ message: `Task successfully ${action}d.`, task: updatedTask });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});