const mongoose = require('mongoose');

const leakageAlertSchema = new mongoose.Schema({
  alertType: {
    type: String,
    enum: ['red', 'yellow', 'green'],
    required: true
  },
  alertLevel: {
    type: String,
    enum: ['critical', 'warning', 'normal'],
    required: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  leakagePercentage: {
    type: Number,
    required: true
  },
  issuedQuantity: {
    type: Number,
    required: true
  },
  consumedQuantity: {
    type: Number,
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'investigating', 'resolved', 'dismissed'],
    default: 'active'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  investigationNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedLoss: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
leakageAlertSchema.index({ hotelId: 1, status: 1, createdAt: -1 });
leakageAlertSchema.index({ alertType: 1, status: 1 });
leakageAlertSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('LeakageAlert', leakageAlertSchema);
