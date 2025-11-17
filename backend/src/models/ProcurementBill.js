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
  gstApplicable: {
    type: Boolean,
    required: true
  },
  gstAmount: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  }
});

const procurementBillSchema = new mongoose.Schema({
  procurementRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProcurementRequest',
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  billNumber: {
    type: String
  },
  billDate: {
    type: Date,
    required: true
  },
  items: [itemSchema],
  totalAmountBeforeGST: {
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
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  billFileUrl: {
    type: String,
    required: true
  },
  remarks: {
    type: String
  }
});

module.exports = mongoose.model('ProcurementBill', procurementBillSchema);
