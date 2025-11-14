const express = require('express');
const router = express.Router();
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  disableItem
} = require('../controllers/itemController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// POST /items - Create item (superadmin, procurement_officer)
router.post('/', authMiddleware, roleMiddleware(['superadmin', 'procurement_officer']), createItem);

// GET /items - Get all items (superadmin, procurement_officer, store_manager, hotel_manager)
router.get('/', authMiddleware, roleMiddleware(['superadmin', 'procurement_officer', 'store_manager', 'hotel_manager']), getItems);

// GET /items/:id - Get single item (superadmin, procurement_officer, store_manager)
router.get('/:id', authMiddleware, roleMiddleware(['superadmin', 'procurement_officer', 'store_manager']), getItemById);

// PUT /items/:id - Update item (superadmin, procurement_officer)
router.put('/:id', authMiddleware, roleMiddleware(['superadmin', 'procurement_officer']), updateItem);

// PATCH /items/:id/disable - Disable item (superadmin, procurement_officer)
router.patch('/:id/disable', authMiddleware, roleMiddleware(['superadmin', 'procurement_officer']), disableItem);

module.exports = router;
