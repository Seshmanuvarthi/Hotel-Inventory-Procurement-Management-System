const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Protected route (any logged-in user)
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Access granted to protected route.', user: req.user });
});

// Superadmin only
router.get('/superadmin-only', authMiddleware, roleMiddleware(['superadmin']), (req, res) => {
  res.json({ message: 'Access granted to superadmin only.', user: req.user });
});

// MD only
router.get('/md-only', authMiddleware, roleMiddleware(['md']), (req, res) => {
  res.json({ message: 'Access granted to MD only.', user: req.user });
});

// Hotel manager only
router.get('/hotel-manager-only', authMiddleware, roleMiddleware(['hotel_manager']), (req, res) => {
  res.json({ message: 'Access granted to hotel manager only.', user: req.user });
});

module.exports = router;
