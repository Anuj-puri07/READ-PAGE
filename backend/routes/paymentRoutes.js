const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/authMiddleware");

// Initiate Khalti payment
router.post(
  "/khalti/initiate",
  verifyToken,
  paymentController.initiateKhaltiPayment
);

// Verify Khalti payment by pidx
router.post(
  "/khalti/verify",
  verifyToken,
  paymentController.verifyKhaltiPayment
);

// Callback route for Khalti payment completion
router.get(
  "/khalti/complete",
  paymentController.completeKhaltiPayment
);

// Get payment status for an order
router.get(
  "/:orderId/status",
  verifyToken,
  paymentController.getPaymentStatus
);

module.exports = router;
