const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: true
  },
  lastPrice: {
    type: Number,
    required: true
  },
  gstApplicable: {
    type: Boolean,
    required: true
  }
});

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  itemDefaultGST: {
    type: Number,
    required: true
  },
  vendors: [vendorSchema],
  lastProcuredAmount: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Item', itemSchema);
