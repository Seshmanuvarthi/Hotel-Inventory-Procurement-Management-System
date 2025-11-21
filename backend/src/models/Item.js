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
  lastProcuredAt: {
    type: Date,
    default: null
  }
});

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  bottleSize: {
    type: Number
  }, // in ml, for bar items
  gstApplicable: {
    type: Boolean,
    default: false
  },
  vendors: [vendorSchema],
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Item', itemSchema);
