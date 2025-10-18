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
    enum: ['pending_annotation', 'in_progress', 'pending_verification', 'completed'],
    default: 'pending_annotation',
  },
  annotatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  correctedText: { type: String },
  gender: { type: String, enum: ['male', 'female'] },
  ageRange: { 
    type: String, 
    enum: ['child', 'teen', 'young', 'middle-aged', 'elderly'],
  },
  
  // === تگ‌های جدید ===
  dialect: { 
    type: String,
    enum: ['tehran', 'isfahan', 'shiraz', 'mashhad', 'kerman', 'yazd', 'kashan', 'bandari', 'northern'],
  },
  emotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral'],
  },
  backgroundNoise: {
    type: String,
    enum: ['none', 'bird', 'animals', 'traffic', 'wind', 'rain', 'music', 'other'],
  },
  profanity: {
    type: String,
    enum: ['yes', 'no'],
  },
  // =====================
  
}, {
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;