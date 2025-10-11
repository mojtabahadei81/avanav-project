const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  audioUrl: {
    type: String,
    required: true,
  },
  originalText: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    // 'in_progress' را به لیست وضعیت‌ها اضافه کردیم
    enum: ['pending_annotation', 'in_progress', 'pending_verification', 'completed'],
    default: 'pending_annotation',
  },
  // --- فیلدهای جدید ---
  annotatedBy: {
    type: mongoose.Schema.Types.ObjectId, // برای ذخیره ID کاربر
    ref: 'User', // ارجاع به مدل 'User'
  },
  // --------------------
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  correctedText: { type: String },
  gender: { type: String, enum: ['male', 'female'] },
  ageRange: { type: String },
}, {
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;