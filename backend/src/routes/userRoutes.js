const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /users - Get all users and vendors (superadmin only)
router.get('/', authMiddleware, roleMiddleware(['superadmin']), async (req, res) => {
  try {
    const users = await User.find({
      isActive: true,
      role: { $in: ['superadmin', 'md', 'procurement_officer', 'store_manager', 'hotel_manager', 'accounts'] }
    }).select('-passwordHash');

    const vendors = await Vendor.find({ isActive: true })
      .select('name email phone contactPerson createdAt')
      .lean();

    // Add a type field to distinguish users from vendors
    const usersWithType = users.map(user => ({ ...user.toObject(), type: 'user' }));
    const vendorsWithType = vendors.map(vendor => ({ ...vendor, type: 'vendor' }));

    const allEntities = [...usersWithType, ...vendorsWithType];

    res.status(200).json({ success: true, data: allEntities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// PATCH /users/:id/disable - Disable user (superadmin only)
router.patch('/:id/disable', authMiddleware, roleMiddleware(['superadmin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, message: 'User disabled successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// PATCH /users/:id/change-role - Change user role (superadmin only)
router.patch('/:id/change-role', authMiddleware, roleMiddleware(['superadmin']), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['superadmin', 'md', 'procurement_officer', 'store_manager', 'hotel_manager', 'accounts'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, message: 'User role updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

// DELETE /users/:id - Delete user (superadmin only)
router.delete('/:id', authMiddleware, roleMiddleware(['superadmin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
});

module.exports = router;
