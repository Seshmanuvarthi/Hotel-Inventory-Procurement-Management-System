const express = require('express');
const router = express.Router();
const { createConsumption, getConsumption } = require('../controllers/consumptionController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// POST /consumption - Create consumption entry (hotel_manager only)
router.post('/', authMiddleware, roleMiddleware(['hotel_manager']), createConsumption);

// GET /consumption - Get consumption records (hotel_manager for own hotel, md/superadmin for all)
router.get('/', authMiddleware, roleMiddleware(['hotel_manager', 'md', 'superadmin']), getConsumption);

module.exports = router;
