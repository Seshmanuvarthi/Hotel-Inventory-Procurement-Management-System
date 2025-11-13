const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Permanent register route (superadmin only)
router.post('/register', authMiddleware, roleMiddleware(['superadmin']), register);

// Login route
router.post('/login', login);

module.exports = router;
