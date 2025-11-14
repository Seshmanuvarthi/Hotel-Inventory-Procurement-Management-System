const mongoose = require('mongoose');

const paymentEntrySchema = new mongoose.Schema({
  procurementBillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProcurementBill',
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'upi', 'bank-transfer'],
    required: true
  },
  paymentDate: {
    type: Date,
    required: true
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  remarks: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PaymentEntry', paymentEntrySchema);
