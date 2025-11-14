const express = require('express');
const router = express.Router();
const {
  getIssuedVsConsumed,
  getConsumedVsSales,
  getLeakageReport,
  getExpectedVsActual,
  getWastageReport
} = require('../controllers/reportsController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /reports/issued-vs-consumed - MD and superadmin only
router.get('/issued-vs-consumed', authMiddleware, roleMiddleware(['md', 'superadmin']), getIssuedVsConsumed);

// GET /reports/consumed-vs-sales - MD and superadmin only
router.get('/consumed-vs-sales', authMiddleware, roleMiddleware(['md', 'superadmin']), getConsumedVsSales);

// GET /reports/leakage - MD and superadmin only
router.get('/leakage', authMiddleware, roleMiddleware(['md', 'superadmin']), getLeakageReport);

// GET /reports/expected-vs-actual - MD and superadmin only
router.get('/expected-vs-actual', authMiddleware, roleMiddleware(['md', 'superadmin']), getExpectedVsActual);

// GET /reports/wastage - MD and superadmin only
router.get('/wastage', authMiddleware, roleMiddleware(['md', 'superadmin']), getWastageReport);

module.exports = router;
