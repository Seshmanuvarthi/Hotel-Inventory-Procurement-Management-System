const Recipe = require('../models/Recipe');

// POST /recipes - Create recipe
const createRecipe = async (req, res) => {
  try {
    const { dishName, ingredients } = req.body;
    const createdBy = req.user.id;

    // Validate ingredients
    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ message: 'At least one ingredient is required' });
    }

    // Check if recipe with same dishName already exists
    const existingRecipe = await Recipe.findOne({ dishName });
    if (existingRecipe) {
      return res.status(400).json({ message: 'Recipe with this dish name already exists' });
    }

    const recipe = new Recipe({
      dishName,
      createdBy,
      ingredients
    });

    await recipe.save();

    res.status(201).json({
      message: 'Recipe created successfully',
      recipe
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating recipe', error: error.message });
  }
};

// GET /recipes - Get all recipes
const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate('createdBy', 'name')
      .populate('ingredients.itemId', 'name unit category')
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes', error: error.message });
  }
};

// GET /recipes/:id - Get single recipe
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('ingredients.itemId', 'name unit category');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipe', error: error.message });
  }
};

// PATCH /recipes/:id - Update recipe
const updateRecipe = async (req, res) => {
  try {
    const { dishName, ingredients } = req.body;

    // Validate ingredients
    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ message: 'At least one ingredient is required' });
    }

    // Check if another recipe with same dishName exists
    const existingRecipe = await Recipe.findOne({ dishName, _id: { $ne: req.params.id } });
    if (existingRecipe) {
      return res.status(400).json({ message: 'Recipe with this dish name already exists' });
    }

    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { dishName, ingredients },
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name')
    .populate('ingredients.itemId', 'name unit category');

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json({
      message: 'Recipe updated successfully',
      recipe
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating recipe', error: error.message });
  }
};

// DELETE /recipes/:id - Delete recipe
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting recipe', error: error.message });
  }
};

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe
};
