const express = require("express")
const { body } = require("express-validator")
const auth = require("../controllers/authController")
const { verifyToken, isAdmin } = require("../middleware/authMiddleware")
const multer = require("multer")
const upload = require("../middleware/upload")

const router = express.Router()

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
    body("phoneNumber").trim().notEmpty().withMessage("Phone number is required"),
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

// Email verification
router.get("/verify-email", auth.verifyEmail)

// Forgot password
router.post("/forgot-password", auth.forgotPassword)

// Reset password
router.post("/reset-password", auth.resetPassword)

// Update profile
router.put("/profile", verifyToken, auth.updateProfile)

// Upload profile photo
router.post("/profile/photo", verifyToken, upload.single('profilePhoto'), auth.uploadProfilePhoto)

// Change password
router.put("/change-password", verifyToken, auth.changePassword)

// Development endpoint to get verification token
router.get("/dev/verification-token/:email", async (req, res) => {
  try {
    const { email } = req.params
    const { getVerificationToken } = require("../utils/devHelper")
    const verificationUrl = await getVerificationToken(email)
    
    if (verificationUrl) {
      return res.json({ 
        message: "Verification URL generated",
        verificationUrl,
        email 
      })
    } else {
      return res.status(404).json({ message: "User not found or already verified" })
    }
  } catch (err) {
    console.error("Get verification token error:", err)
    return res.status(500).json({ message: "Failed to get verification token" })
  }
})

module.exports = router


