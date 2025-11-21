const express = require('express');
const router = express.Router();
const { createConsumption, getConsumption, calculateConsumptionFromSales } = require('../controllers/consumptionController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// POST /consumption - Create consumption entry (hotel_manager only)
router.post('/', authMiddleware, roleMiddleware(['hotel_manager']), createConsumption);

// GET /consumption - Get consumption records
router.get('/', authMiddleware, roleMiddleware(['hotel_manager', 'store_manager', 'super_admin', 'md']), getConsumption);



module.exports = router;
