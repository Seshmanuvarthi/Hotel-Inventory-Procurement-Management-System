const mongoose = require('mongoose');

const leakageTrendSchema = new mongoose.Schema({
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
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  date: {
    type: Date,
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
  leakagePercentage: {
    type: Number,
    required: true
  },
  estimatedValue: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['vegetables', 'proteins', 'grains', 'dairy', 'spices', 'beverages', 'other'],
    required: true
  },
  seasonalFactor: {
    type: Number,
    default: 1
  },
  predictedLeakage: {
    type: Number,
    default: 0
  },
  anomalyScore: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
leakageTrendSchema.index({ hotelId: 1, itemId: 1, date: -1 });
leakageTrendSchema.index({ category: 1, date: -1 });
leakageTrendSchema.index({ period: 1, date: -1 });

module.exports = mongoose.model('LeakageTrend', leakageTrendSchema);
