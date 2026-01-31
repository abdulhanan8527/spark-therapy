const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 180
  },
  sessionType: {
    type: String,
    enum: ['assessment', 'therapy', 'evaluation', 'consultation', 'other'],
    default: 'therapy'
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  recurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Schedule', scheduleSchema);