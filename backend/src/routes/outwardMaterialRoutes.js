const express = require('express');
const router = express.Router();
const outwardMaterialRequestController = require('../controllers/outwardMaterialRequestController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Routes for outward material requests
router.post('/', authMiddleware, roleMiddleware(['store_manager', 'md']), outwardMaterialRequestController.createOutwardMaterialRequest);
router.get('/', authMiddleware, roleMiddleware(['store_manager', 'md', 'hotel_manager']), outwardMaterialRequestController.getOutwardMaterialRequests);
router.get('/:id', authMiddleware, roleMiddleware(['store_manager', 'md', 'hotel_manager']), outwardMaterialRequestController.getOutwardMaterialRequestById);
router.put('/:id/issue', authMiddleware, roleMiddleware(['store_manager', 'md']), outwardMaterialRequestController.issueOutwardMaterialRequest);

// Route to get items by category
router.get('/items/category', authMiddleware, roleMiddleware(['store_manager', 'md']), outwardMaterialRequestController.getItemsByCategory);

module.exports = router;
