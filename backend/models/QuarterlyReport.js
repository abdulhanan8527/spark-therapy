const mongoose = require('mongoose');

const quarterlyReportSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: [true, 'Child ID is required'],
    index: true
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Therapist ID is required'],
    index: true
  },
  period: {
    type: String,
    required: [true, 'Report period is required'],
    trim: true
  },
  progressSummary: {
    type: String,
    required: [true, 'Progress summary is required']
  },
  goalsAchieved: {
    type: String,
    default: ''
  },
  areasForImprovement: {
    type: String,
    default: ''
  },
  recommendations: {
    type: String,
    default: ''
  },
  nextSteps: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved'],
    default: 'pending'
  },
  submittedDate: {
    type: Date,
    default: Date.now
  },
  reviewedDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
quarterlyReportSchema.index({ childId: 1, period: 1 });
quarterlyReportSchema.index({ therapistId: 1, status: 1 });

const QuarterlyReport = mongoose.model('QuarterlyReport', quarterlyReportSchema);

module.exports = QuarterlyReport;
