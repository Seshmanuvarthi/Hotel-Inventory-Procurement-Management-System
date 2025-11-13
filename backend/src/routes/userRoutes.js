const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// GET /users - Get all users (superadmin only)
router.get('/', authMiddleware, roleMiddleware(['superadmin']), async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-passwordHash');
    res.status(200).json({ success: true, data: users });
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

module.exports = router;
