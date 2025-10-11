// in server/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const csv = require('csv-parser');
const fs = require('fs');
const upload = require('../config/multerConfig');
const Task = require('../models/TaskModel');
const User = require('../models/UserModel');

// @desc    Upload audio files and a metadata CSV to create tasks
// @route   POST /api/admin/upload
// @access  Private/Admin
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
            const audioFilename = record.audio_filename;
            const transcript = record.transcript;
            if (!audioFilename || !transcript) {
              console.warn('Skipping invalid CSV record:', record);
              continue;
            }
            await Task.create({
              audioUrl: `/uploads/${audioFilename}`,
              originalText: transcript,
              status: 'pending_annotation',
            });
            createdCount++;
          }
          res.status(201).json({ message: `${createdCount} tasks created successfully.` });
        } catch (error) {
          console.error('Error creating tasks:', error);
          res.status(500).json({ message: 'Failed to create tasks from CSV.' });
        }
      });
  }
);

// --- START: روت‌های جدید برای مدیریت کاربران ---

// @desc    Get all users with their stats
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }).select('-password').lean();
    for (const user of users) {
      const annotationsCompleted = await Task.countDocuments({
        annotatedBy: user._id,
        status: 'completed',
      });
      const verificationsCompleted = await Task.countDocuments({
        verifiedBy: user._id,
      });
      user.stats = { annotationsCompleted, verificationsCompleted };
    }
    res.json(users);
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Reset stats for a specific user or all users
// @route   PUT /api/admin/users/reset
// @access  Private/Admin
router.put('/users/reset', async (req, res) => { // <-- دقت کنید که اینجا ID کاربر وجود ندارد
  try {
    // 1. ریست کردن تمام اصلاح‌ها
    await Task.updateMany(
      { annotatedBy: { $exists: true } },
      { $unset: { annotatedBy: "" } }
    );
    // 2. ریست کردن تمام تاییدها
    await Task.updateMany(
      { verifiedBy: { $exists: true } },
      { $unset: { verifiedBy: "" } }
    );
    res.json({ message: `Stats for all users have been reset successfully.` });
  } catch (error) {
    console.error('Error resetting all user stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});
// --- END: پایان روت‌های جدید ---

module.exports = router;