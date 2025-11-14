const express = require('express');
const router = express.Router();
const {
  createPayment,
  getAllPayments,
  getPaymentsByVendor,
  getPendingPayments,
  getPaymentSummary
} = require('../controllers/paymentsController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// POST /payments - accounts, superadmin
router.post('/', authMiddleware, roleMiddleware(['accounts', 'superadmin']), createPayment);

// GET /payments - accounts, md, superadmin
router.get('/', authMiddleware, roleMiddleware(['accounts', 'md', 'superadmin']), getAllPayments);

// GET /payments/vendor/:vendorName - accounts, md, superadmin
router.get('/vendor/:vendorName', authMiddleware, roleMiddleware(['accounts', 'md', 'superadmin']), getPaymentsByVendor);

// GET /payments/pending - accounts, md, superadmin
router.get('/pending', authMiddleware, roleMiddleware(['accounts', 'md', 'superadmin']), getPendingPayments);

// GET /payments/summary - accounts, md, superadmin
router.get('/summary', authMiddleware, roleMiddleware(['accounts', 'md', 'superadmin']), getPaymentSummary);

module.exports = router;
