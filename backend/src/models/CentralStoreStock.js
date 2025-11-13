const mongoose = require('mongoose');

const centralStoreStockSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    unique: true,
    required: true
  },
  quantityOnHand: {
    type: Number,
    required: true
  },
  reorderLevelPercent: {
    type: Number,
    default: 65
  },
  minimumStockLevel: {
    type: Number
  },
  previousMaxStock: {
    type: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CentralStoreStock', centralStoreStockSchema);
