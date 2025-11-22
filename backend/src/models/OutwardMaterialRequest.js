const mongoose = require('mongoose');

const outwardMaterialRequestItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  quantityToIssue: {
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
    enum: ['pending', 'issued'],
    default: 'pending'
  }
});

const outwardMaterialRequestSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  items: [outwardMaterialRequestItemSchema],
  overallStatus: {
    type: String,
    enum: ['pending', 'issued'],
    default: 'pending'
  },
  remarks: {
    type: String
  },
  issuedAt: {
    type: Date
  }
});

module.exports = mongoose.model('OutwardMaterialRequest', outwardMaterialRequestSchema);
