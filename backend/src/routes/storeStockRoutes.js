const express = require('express');
const router = express.Router();
const {
  getStoreStock,
  increaseStockOnProcurement,
  decreaseStockOnIssue,
  getInwardStockLogs,
  getOutwardStockLogs
} = require('../controllers/storeStockController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Get store stock - accessible to store_manager, superadmin, md
router.get('/stock', authMiddleware, roleMiddleware(['store_manager', 'superadmin', 'md']), getStoreStock);

// Increase stock on procurement - accessible to procurement_officer, superadmin, md
router.patch('/stock/add-on-procurement', authMiddleware, roleMiddleware(['procurement_officer', 'superadmin', 'md']), increaseStockOnProcurement);

// Decrease stock on issue - accessible to store_manager, superadmin, md
router.patch('/stock/issue-to-hotel', authMiddleware, roleMiddleware(['store_manager', 'superadmin', 'md']), decreaseStockOnIssue);

// Get inward stock logs - accessible to store_manager, superadmin, md
router.get('/inward-logs', authMiddleware, roleMiddleware(['store_manager', 'superadmin', 'md']), getInwardStockLogs);

// Get outward stock logs - accessible to store_manager, superadmin, md
router.get('/outward-logs', authMiddleware, roleMiddleware(['store_manager', 'superadmin', 'md']), getOutwardStockLogs);

module.exports = router;
