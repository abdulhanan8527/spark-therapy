const mongoose = require('mongoose');

const targetSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  isMastered: {
    type: Boolean,
    default: false
  },
  masteredDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const programSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  abllsCode: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true
  },
  longDescription: {
    type: String,
    trim: true
  },
  masteryCriteria: {
    type: String,
    trim: true
  },
  dataCollectionMethod: {
    type: String,
    enum: ['frequency', 'duration', 'interval', 'permanent-product'],
    default: 'frequency'
  },
  targets: [targetSchema],
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Program', programSchema);