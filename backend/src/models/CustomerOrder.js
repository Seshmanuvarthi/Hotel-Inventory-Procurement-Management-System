const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  dishName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    default: 1 // in ml, for non-bar items it's 1
  },
  pricePerMl: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'plates' // plates for food, ml for bar items
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  items: [orderItemSchema]
});

const customerOrderSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  orders: [orderSchema],
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

module.exports = mongoose.model('CustomerOrder', customerOrderSchema);
