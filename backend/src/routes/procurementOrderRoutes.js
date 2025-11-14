const express = require('express');
const router = express.Router();
const {
  createProcurementOrder,
  getAllProcurementOrders,
  getProcurementOrderById,
  mdApproveOrder,
  mdRejectOrder,
  markAsPaid
} = require('../controllers/procurementOrderController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Create procurement order - procurement_officer, superadmin
router.post('/', authMiddleware, roleMiddleware(['procurement_officer', 'superadmin']), createProcurementOrder);

// Get all procurement orders - procurement_officer, md, accounts, superadmin
router.get('/', authMiddleware, roleMiddleware(['procurement_officer', 'md', 'accounts', 'superadmin']), getAllProcurementOrders);

// Get procurement order by ID - procurement_officer, md, accounts, superadmin
router.get('/:id', authMiddleware, roleMiddleware(['procurement_officer', 'md', 'accounts', 'superadmin']), getProcurementOrderById);

// MD approve order - md, superadmin
router.patch('/:id/approve', authMiddleware, roleMiddleware(['md', 'superadmin']), mdApproveOrder);

// MD reject order - md, superadmin
router.patch('/:id/reject', authMiddleware, roleMiddleware(['md', 'superadmin']), mdRejectOrder);

// Mark as paid - accounts, superadmin
router.patch('/:id/pay', authMiddleware, roleMiddleware(['accounts', 'superadmin']), markAsPaid);

module.exports = router;
