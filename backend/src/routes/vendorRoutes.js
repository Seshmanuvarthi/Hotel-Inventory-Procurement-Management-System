const express = require('express');
const router = express.Router();
const {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  disableVendor
} = require('../controllers/vendorController');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// POST /vendors - Create vendor (superadmin)
router.post('/', authMiddleware, roleMiddleware(['superadmin']), createVendor);

// GET /vendors - Get all vendors (superadmin, procurement_officer, accounts)
router.get('/', authMiddleware, roleMiddleware(['superadmin', 'procurement_officer', 'accounts']), getVendors);

// GET /vendors/:id - Get single vendor (superadmin, procurement_officer, accounts)
router.get('/:id', authMiddleware, roleMiddleware(['superadmin', 'procurement_officer', 'accounts']), getVendorById);

// PUT /vendors/:id - Update vendor (superadmin)
router.put('/:id', authMiddleware, roleMiddleware(['superadmin']), updateVendor);

// PATCH /vendors/:id/disable - Disable vendor (superadmin)
router.patch('/:id/disable', authMiddleware, roleMiddleware(['superadmin']), disableVendor);

module.exports = router;
