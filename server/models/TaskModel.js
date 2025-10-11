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
  // Fields to be filled by the annotator
  correctedText: { type: String },
  gender: { type: String, enum: ['male', 'female'] },
  ageRange: { type: String },
  // We will add user references later
}, {
  timestamps: true, // This automatically adds createdAt and updatedAt fields
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;