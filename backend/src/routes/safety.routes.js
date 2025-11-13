const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safety.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All safety routes require authentication
router.use(authMiddleware);

// Submit safety check-in
router.post('/check-in', safetyController.submitCheckIn);

// Get crisis resources
router.get('/resources', safetyController.getResources);

// Request therapist referral
router.post('/referral', safetyController.requestReferral);

module.exports = router;

