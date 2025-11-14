const express = require('express');
const router = express.Router();
const {
  getSummary,
  getLeakageChart,
  getHotelLeakage,
  getProcurementVsPayments,
  getItemConsumptionTrend,
  getExpectedVsActualTopItems,
  getVendorPerformance,
  getInsights
} = require('../controllers/mdDashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All routes require MD or superadmin role
const mdOrSuperadmin = roleMiddleware(['md', 'superadmin']);

// GET /md-dashboard/summary
router.get('/summary', authMiddleware, mdOrSuperadmin, getSummary);

// GET /md-dashboard/leakage-chart?from=&to=
router.get('/leakage-chart', authMiddleware, mdOrSuperadmin, getLeakageChart);

// GET /md-dashboard/hotel-leakage?from=&to=
router.get('/hotel-leakage', authMiddleware, mdOrSuperadmin, getHotelLeakage);

// GET /md-dashboard/procurement-vs-payments?year=
router.get('/procurement-vs-payments', authMiddleware, mdOrSuperadmin, getProcurementVsPayments);

// GET /md-dashboard/item-consumption-trend?itemId=&range=
router.get('/item-consumption-trend', authMiddleware, mdOrSuperadmin, getItemConsumptionTrend);

// GET /md-dashboard/expected-vs-actual-top-items?from=&to=
router.get('/expected-vs-actual-top-items', authMiddleware, mdOrSuperadmin, getExpectedVsActualTopItems);

// GET /md-dashboard/vendor-performance?from=&to=
router.get('/vendor-performance', authMiddleware, mdOrSuperadmin, getVendorPerformance);

// GET /md-dashboard/insights?from=&to=
router.get('/insights', authMiddleware, mdOrSuperadmin, getInsights);

module.exports = router;
