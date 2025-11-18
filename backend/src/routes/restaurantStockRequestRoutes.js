const express = require('express');
const router = express.Router();
const {
  createRestaurantStockRequest,
  getRestaurantStockRequests,
  getPendingRestaurantStockRequests,
  getRestaurantStockRequestById,
  fulfillRestaurantStockRequest,
  rejectRestaurantStockRequest
} = require('../controllers/restaurantStockRequestController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Create restaurant stock request - hotel_manager
router.post('/', authMiddleware, roleMiddleware(['hotel_manager']), createRestaurantStockRequest);

// Get restaurant stock requests for current user's restaurant - hotel_manager
router.get('/', authMiddleware, roleMiddleware(['hotel_manager']), getRestaurantStockRequests);

// Get all pending restaurant stock requests - store_manager, superadmin
router.get('/pending', authMiddleware, roleMiddleware(['store_manager', 'superadmin']), getPendingRestaurantStockRequests);

// Get restaurant stock request by ID - hotel_manager, store_manager, superadmin
router.get('/:id', authMiddleware, roleMiddleware(['hotel_manager', 'store_manager', 'superadmin']), getRestaurantStockRequestById);

// Fulfill restaurant stock request - store_manager, superadmin
router.patch('/:id/fulfill', authMiddleware, roleMiddleware(['store_manager', 'superadmin']), fulfillRestaurantStockRequest);

// Reject restaurant stock request - store_manager, superadmin
router.patch('/:id/reject', authMiddleware, roleMiddleware(['store_manager', 'superadmin']), rejectRestaurantStockRequest);

module.exports = router;
