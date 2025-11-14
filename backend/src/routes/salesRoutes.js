const express = require('express');
const router = express.Router();
const { createSales, getSales } = require('../controllers/salesController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// POST /sales - Create sales entry (hotel_manager only)
router.post('/', authMiddleware, roleMiddleware(['hotel_manager']), createSales);

// GET /sales - Get sales records (hotel_manager for own hotel, md/superadmin for all)
router.get('/', authMiddleware, roleMiddleware(['hotel_manager', 'md', 'superadmin']), getSales);

module.exports = router;
