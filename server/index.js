const express = require('express');
const cors = require('cors'); // 1. Import cors
require('dotenv').config();
const connectDB = require('./config/db');
const Task = require('./models/TaskModel');

const userRoutes = require('./routes/userRoutes'); // 1. ایمپورت کردن روت‌ها
const adminRoutes = require('./routes/adminRoutes'); // <-- 2. روت ادمین را ایمپورت کنید

const { protect } = require('./middleware/authMiddleware');
const { admin } = require('./middleware/adminMiddleware'); // <-- 1. میدل‌ور ادمین را ایمپورت کنید


connectDB();

const app = express();
app.use(cors()); // 2. Use cors middleware
app.use(express.json()); // <-- This line is crucial for reading JSON from requests
app.use('/uploads', express.static('server/uploads')); // <-- 3. این خط مهم را اضافه کنید
app.use(express.static('public'));
app.use('/api/users', userRoutes); // 2. استفاده از روت‌ها
app.use('/api/admin', protect, admin, adminRoutes); 

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('API is running...');
});

// @desc    Fetch the next available task for annotation
// @route   GET /api/tasks/next
// @desc    Get the next available task based on mode (annotation or verification)
// @route   GET /api/tasks/next?mode=annotation
app.get('/api/tasks/next', protect, async (req, res) => { // 'protect' اضافه شد
  try {
    const { mode } = req.query;
    const userId = req.user._id; // ID کاربر از میدل‌ور protect می‌آید

    if (mode === 'annotation') {
      // پیدا کردن یک تسک و آپدیت اتمیک آن برای قفل کردن
      const task = await Task.findOneAndUpdate(
        { status: 'pending_annotation' },
        { status: 'in_progress', annotatedBy: userId },
        { new: true } // برگرداندن داکیومنت آپدیت شده
      );

      if (!task) {
        return res.status(404).json({ message: 'No available annotation tasks at the moment.' });
      }
      res.json(task);

    } else if (mode === 'verification') {
      // پیدا کردن یک تسک که در انتظار تایید است و توسط کاربر دیگری اصلاح شده
      const task = await Task.findOne({
        status: 'pending_verification',
        annotatedBy: { $ne: userId } // شرط کلیدی: کاربر اصلاح‌کننده، کاربر فعلی نباشد
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

// ... (after the GET endpoint)

// @desc    Update a task with correction data
// @route   PUT /api/tasks/:id
app.put('/api/tasks/:id', protect, async (req, res) => { // 'protect' اضافه شد
  try {
    const { correctedText, gender, ageRange } = req.body;
    const taskId = req.params.id;

    // Find the task by its ID and update it
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        correctedText,
        gender,
        ageRange,
        status: 'pending_verification', // The task is now waiting for verification
      },
      { new: true } // This option returns the updated document
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json(updatedTask); // Send back the updated task as confirmation
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// ... (after the other app.put, app.get endpoints)

// @desc    Verify (approve/reject) a task
// @route   POST /api/tasks/:id/verify
app.post('/api/tasks/:id/verify', protect, async (req, res) => {
  try {
    const { action } = req.body;
    const taskId = req.params.id;
    const verifierId = req.user._id; // <-- ID کاربر تاییدکننده

    let updateData;

    if (action === 'approve') {
      // اگر تایید شد، ID تاییدکننده را هم ثبت کن
      updateData = { status: 'completed', verifiedBy: verifierId }; // <-- تغییر در این خط
    } else if (action === 'reject') {
      // اگر رد شد، اطلاعات اصلاح قبلی و اصلاح‌کننده را پاک کن
      updateData = { 
        status: 'pending_annotation',
        correctedText: '',
        gender: '',
        ageRange: '',
        annotatedBy: null, // <-- پاک کردن اصلاح‌کننده قبلی
      };
    } else {
      return res.status(400).json({ message: 'Invalid action.' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { $set: updateData }, // Using $set to apply the changes
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