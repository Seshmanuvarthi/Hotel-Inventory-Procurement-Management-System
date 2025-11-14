const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  quantityRequired: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  }
});

const recipeSchema = new mongoose.Schema({
  dishName: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ingredients: [ingredientSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Recipe', recipeSchema);
