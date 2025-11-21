const express = require('express');
const router = express.Router();
const { createOrders, getOrders } = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// POST /orders - Create order entry (hotel_manager only)
router.post('/', authMiddleware, roleMiddleware(['hotel_manager']), createOrders);

// GET /orders - Get order records (hotel_manager for own hotel, md/superadmin for all)
router.get('/', authMiddleware, roleMiddleware(['hotel_manager', 'md', 'superadmin']), getOrders);

module.exports = router;
