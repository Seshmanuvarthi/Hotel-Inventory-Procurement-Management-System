const express = require('express');
const router = express.Router();
const {
  createStockIssue,
  getIssueLogs,
  getIssueLogByHotel
} = require('../controllers/stockIssueController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Create stock issue - only store_manager can issue stock
router.post('/issue', authMiddleware, roleMiddleware(['store_manager']), createStockIssue);

// Get all issue logs - accessible to store_manager, superadmin, md
router.get('/issue/logs', authMiddleware, roleMiddleware(['store_manager', 'superadmin', 'md']), getIssueLogs);

// Get issue logs by hotel - accessible to store_manager, superadmin, md
router.get('/issue/:hotelId', authMiddleware, roleMiddleware(['store_manager', 'superadmin', 'md']), getIssueLogByHotel);

module.exports = router;
