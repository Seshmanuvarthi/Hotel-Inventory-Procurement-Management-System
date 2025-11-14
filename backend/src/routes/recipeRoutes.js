const express = require('express');
const router = express.Router();
const {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe
} = require('../controllers/recipeController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// POST /recipes - Create recipe (MD, superadmin)
router.post('/', authMiddleware, roleMiddleware(['md', 'superadmin']), createRecipe);

// GET /recipes - Get all recipes (all authenticated users)
router.get('/', authMiddleware, getRecipes);

// GET /recipes/:id - Get single recipe (all authenticated users)
router.get('/:id', authMiddleware, getRecipeById);

// PATCH /recipes/:id - Update recipe (MD, superadmin)
router.patch('/:id', authMiddleware, roleMiddleware(['md', 'superadmin']), updateRecipe);

// DELETE /recipes/:id - Delete recipe (MD, superadmin)
router.delete('/:id', authMiddleware, roleMiddleware(['md', 'superadmin']), deleteRecipe);

module.exports = router;
