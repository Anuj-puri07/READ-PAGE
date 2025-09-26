const express = require("express")
const { body } = require("express-validator")
const auth = require("../controllers/authController")
const { verifyToken, isAdmin } = require("../middleware/authMiddleware")

const router = express.Router()

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  auth.register
)

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  auth.login
)

// Get all customers (admin only)
router.get("/customers", verifyToken, isAdmin, auth.getCustomers)

// Get user with their order details (admin only)
router.get("/users/:id/orders", verifyToken, auth.getUserWithOrders)

// Get current user profile with orders
router.get("/profile", verifyToken, auth.getUserProfile)

// Get customer orders
router.get("/orders", verifyToken, auth.getCustomerOrders)

module.exports = router


