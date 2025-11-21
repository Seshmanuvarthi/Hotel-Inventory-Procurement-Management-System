const mongoose = require('mongoose');

const fromOrdersSchema = new mongoose.Schema({
  dishName: {
    type: String,
    required: true
  },
  quantityOrdered: {
    type: Number,
    required: true
  },
  recipeQtyRequired: {
    type: Number,
    required: true
  },
  calculated: {
    type: Number,
    required: true
  }
});

const expectedItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  expectedQuantity: {
    type: Number,
    required: true
  },
  fromOrders: [fromOrdersSchema]
});

const expectedConsumptionSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  items: [expectedItemSchema]
}, {
  timestamps: true
});

// Compound index to ensure one document per hotel per date
expectedConsumptionSchema.index({ hotelId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ExpectedConsumption', expectedConsumptionSchema);
