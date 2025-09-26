const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');

// Verify Khalti payment
router.post('/khalti/verify', verifyToken, paymentController.verifyKhaltiPayment);

// Get payment status
router.get('/:orderId/status', verifyToken, paymentController.getPaymentStatus);

module.exports = router;