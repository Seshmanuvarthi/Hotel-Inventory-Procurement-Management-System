const express = require('express');
const router = express.Router();
const {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel
} = require('../controllers/hotelController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// POST /hotels - Create new hotel (superadmin only)
router.post('/', authMiddleware, roleMiddleware(['superadmin']), createHotel);

// GET /hotels - Get all hotels (multiple roles)
router.get('/', authMiddleware, roleMiddleware(['superadmin', 'md', 'procurement_officer', 'store_manager']), getHotels);

// GET /hotels/:id - Get single hotel (multiple roles)
router.get('/:id', authMiddleware, roleMiddleware(['superadmin', 'md', 'procurement_officer', 'store_manager']), getHotelById);

// PUT /hotels/:id - Update hotel (superadmin only)
router.put('/:id', authMiddleware, roleMiddleware(['superadmin']), updateHotel);

// DELETE /hotels/:id - Delete hotel (superadmin only)
router.delete('/:id', authMiddleware, roleMiddleware(['superadmin']), deleteHotel);

module.exports = router;
