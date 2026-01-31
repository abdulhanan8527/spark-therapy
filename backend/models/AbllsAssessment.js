const mongoose = require('mongoose');

const abllsAssessmentSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  evaluatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming users include therapists who can evaluate
    required: true
  },
  assessmentDate: {
    type: Date,
    required: true
  },
  areas: {
    type: Object, // This will hold the assessment results for different areas
    required: true,
    default: {}
  },
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'completed', 'archived'],
    default: 'draft'
  },
  notes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AbllsAssessment', abllsAssessmentSchema);