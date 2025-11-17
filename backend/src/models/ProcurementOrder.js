const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
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
  gstPercentage: {
    type: Number,
    required: true,
    default: 5
  },
  gstAmount: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  mdApprovalStatus: {
    type: String,
    enum: ['approved', 'rejected'],
    default: 'approved' // Default to approved for backward compatibility
  },
  receivedStatus: {
    type: String,
    enum: ['pending', 'received', 'partial', 'not_received'],
    default: 'pending'
  },
  receivedQuantity: {
    type: Number,
    default: 0
  }
});

const procurementOrderSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: true
  },
  billNumber: {
    type: String,
    required: false // Initially null, becomes required after MD approval
  },
  billDate: {
    type: Date,
    required: false
  },
  items: [itemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  gstTotal: {
    type: Number,
    required: true
  },
  finalAmount: {
    type: Number,
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedByMD: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  billImageUrl: {
    type: String
  },
  billUploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  billUploadedAt: {
    type: Date
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  paidAt: {
    type: Date
  },
  paymentMode: {
    type: String,
    enum: ['upi', 'cash', 'bank-transfer']
  },
  status: {
    type: String,
    enum: [
      'pending_md_approval',
      'md_approved',
      'bill_uploaded',
      'pending_accounts_approval',
      'accounts_approved',
      'rejected',
      'pending_payment',
      'paid'
    ],
    default: 'pending_md_approval'
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProcurementOrder', procurementOrderSchema);
