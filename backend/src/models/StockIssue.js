const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  quantityIssued: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  previousStockAfterIssue: {
    type: Number,
    required: true
  }
});

const stockIssueSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  items: [itemSchema],
  requestType: {
    type: String,
    enum: ['manual', 'system-request'],
    required: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId
  },
  dateIssued: {
    type: Date,
    default: Date.now
  },
  remarks: {
    type: String
  },
  issueNumber: {
    type: String
  }
});

module.exports = mongoose.model('StockIssue', stockIssueSchema);
