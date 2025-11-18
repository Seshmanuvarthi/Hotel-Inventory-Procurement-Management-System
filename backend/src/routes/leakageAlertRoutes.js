const express = require('express');
const router = express.Router();
const {
  generateLeakageAlerts,
  getLeakageAlerts,
  updateAlertStatus,
  getAlertStatistics
} = require('../controllers/leakageAlertController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Generate leakage alerts - md, superadmin
router.post('/generate', authMiddleware, roleMiddleware(['md', 'superadmin']), generateLeakageAlerts);

// Get leakage alerts - md, superadmin
router.get('/', authMiddleware, roleMiddleware(['md', 'superadmin']), getLeakageAlerts);

// Update alert status - md, superadmin
router.patch('/:id/status', authMiddleware, roleMiddleware(['md', 'superadmin']), updateAlertStatus);

// Get alert statistics - md, superadmin
router.get('/statistics', authMiddleware, roleMiddleware(['md', 'superadmin']), getAlertStatistics);

module.exports = router;
