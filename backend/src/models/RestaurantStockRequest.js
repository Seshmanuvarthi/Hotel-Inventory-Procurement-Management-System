const mongoose = require('mongoose');

const restaurantStockRequestItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  requestedQuantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  issuedQuantity: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'partially_issued', 'fulfilled', 'rejected'],
    default: 'pending'
  }
});

const restaurantStockRequestSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  items: [restaurantStockRequestItemSchema],
  overallStatus: {
    type: String,
    enum: ['pending', 'partially_issued', 'fulfilled', 'rejected'],
    default: 'pending'
  },
  remarks: {
    type: String
  },
  fulfilledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  fulfilledAt: {
    type: Date
  }
});

module.exports = mongoose.model('RestaurantStockRequest', restaurantStockRequestSchema);
