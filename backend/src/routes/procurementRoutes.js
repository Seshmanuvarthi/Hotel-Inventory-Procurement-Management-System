const express = require('express');
const router = express.Router();
const {
  createProcurementRequest,
  getAllRequests,
  getRequestById,
  mdApproveRequest,
  mdRejectRequest,
  getBills,
  getBillById
} = require('../controllers/procurementController');
const { uploadBill } = require('../controllers/procurementBillController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Create procurement request - procurement_officer, superadmin
router.post('/request', authMiddleware, roleMiddleware(['procurement_officer', 'superadmin']), createProcurementRequest);

// Get all procurement requests - procurement_officer, md, accounts, superadmin
router.get('/', authMiddleware, roleMiddleware(['procurement_officer', 'md', 'accounts', 'superadmin']), getAllRequests);

// Get procurement request by ID - procurement_officer, md, accounts, superadmin
router.get('/:id', authMiddleware, roleMiddleware(['procurement_officer', 'md', 'accounts', 'superadmin']), getRequestById);

// MD approve request - md, superadmin
router.patch('/:id/approve', authMiddleware, roleMiddleware(['md', 'superadmin']), mdApproveRequest);

// MD reject request - md, superadmin
router.patch('/:id/reject', authMiddleware, roleMiddleware(['md', 'superadmin']), mdRejectRequest);

// Upload bill - accounts, superadmin
router.post('/:id/bill', authMiddleware, roleMiddleware(['accounts', 'superadmin']), uploadBill);

// Get all bills - accounts, md, superadmin
router.get('/bills', authMiddleware, roleMiddleware(['accounts', 'md', 'superadmin']), getBills);

// Get bill by ID - accounts, md, superadmin
router.get('/bill/:id', authMiddleware, roleMiddleware(['accounts', 'md', 'superadmin']), getBillById);

module.exports = router;
