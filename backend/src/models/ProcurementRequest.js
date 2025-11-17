const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  gstApplicable: {
    type: Boolean,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  }
});

const approvalLogSchema = new mongoose.Schema({
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['approved', 'rejected'],
    required: true
  },
  remarks: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const procurementRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  items: [itemSchema],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvalLogs: [approvalLogSchema],
  remarks: {
    type: String
  },
  source: {
    type: String,
    enum: ['manual', 'xlsx-upload'],
    required: true
  }
});

module.exports = mongoose.model('ProcurementRequest', procurementRequestSchema);
