const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  dishName: {
    type: String,
    required: true
  },
  quantitySold: {
    type: Number,
    required: true
  },
  pricePerUnit: {
    type: Number
  },
  amount: {
    type: Number
  }
});

const salesEntrySchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  sales: [saleSchema],
  totalSalesAmount: {
    type: Number,
    required: true
  },
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

module.exports = mongoose.model('SalesEntry', salesEntrySchema);
