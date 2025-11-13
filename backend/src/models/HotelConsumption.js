const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  quantityConsumed: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  openingBalance: {
    type: Number,
    required: true
  },
  closingBalance: {
    type: Number,
    required: true
  }
});

const hotelConsumptionSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  items: [itemSchema],
  date: {
    type: Date,
    default: Date.now
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  remarks: {
    type: String
  }
});

module.exports = mongoose.model('HotelConsumption', hotelConsumptionSchema);
