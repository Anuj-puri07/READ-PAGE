const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")
const User = require("../models/User")
const Order = require("../models/Order")
const { verifyToken, isAdmin } = require("../middleware/authMiddleware")
const { generateVerificationToken, generateOTP, sendVerificationEmail, sendPasswordResetOTP } = require("../utils/emailService")
const { uploadImage } = require("../utils/cloudinaryService")

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

exports.register = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { name, username, email, password, phoneNumber } = req.body
  try {
    // Check if email already exists
    const existingEmail = await User.findOne({ where: { email } })
    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use" })
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ where: { username } })
    if (existingUsername) {
      return res.status(409).json({ message: "Username already in use" })
    }

    // Check if phone number already exists
    const existingPhone = await User.findOne({ where: { phoneNumber } })
    if (existingPhone) {
      return res.status(409).json({ message: "Phone number already in use" })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const verificationToken = generateVerificationToken()
    
    const user = await User.create({ 
      name, 
      username, 
      email, 
      phoneNumber,
      passwordHash, 
      emailVerificationToken: verificationToken,
      role: 'customer' 
    })

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken, username)
    if (!emailSent) {
      console.error('Failed to send verification email')
    }

    return res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
      user: { 
        id: user.id, 
        name: user.name, 
        username: user.username,
        email: user.email, 
        phoneNumber: user.phoneNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    })
  } catch (err) {
    console.error("Register error:", err)
    return res.status(500).json({ message: "Internal server error" })
  }
}

exports.login = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { email, password } = req.body
  try {
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        message: "Please verify your email address before logging in. Check your email for verification link." 
      })
    }

    const token = signToken(user)
    return res.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        username: user.username,
        email: user.email, 
        phoneNumber: user.phoneNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }, 
      token 
    })
  } catch (err) {
    console.error("Login error:", err)
    return res.status(500).json({ message: "Internal server error" })
  }
}

// Get current user profile with their orders
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user.sub
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    })
    
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    return res.json({
      user: user.toJSON()
    })
  } catch (err) {
    console.error("Get user profile error:", err)
    return res.status(500).json({ message: "Failed to fetch user profile" })
  }
}

// Get customer orders
exports.getCustomerOrders = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Set up association for this query
    Order.belongsTo(require('../models/Book'), { foreignKey: 'BookId' })
    
    const orders = await Order.findAll({
      where: { UserId: userId },
      include: [
        {
          model: require('../models/Book'),
          attributes: ['id', 'title', 'price']
        }
      ],
      order: [['createdAt', 'DESC']]
    })
    
    return res.json({ orders })
  } catch (err) {
    console.error("Get customer orders error:", err)
    return res.status(500).json({ message: "Failed to fetch customer orders" })
  }
}

// Get user with their order details (admin only)
exports.getUserWithOrders = async (req, res) => {
  try {
    const userId = req.params.id
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    })
    
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    const orders = await Order.findAll({
      where: { UserId: userId },
      include: [
        {
          model: require('../models/Book'),
          attributes: ['id', 'title', 'price']
        }
      ],
      order: [['createdAt', 'DESC']]
    })
    
    return res.json({
      user: user.toJSON(),
      orders
    })
  } catch (err) {
    console.error("Get user with orders error:", err)
    return res.status(500).json({ message: "Failed to fetch user with orders" })
  }
}

// Get all customers with search and pagination
exports.getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ""
    const offset = (page - 1) * limit

    // Build where clause for search
    const whereClause = {
      role: 'customer'
    }

    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.like]: `%${search}%` } },
        { email: { [require('sequelize').Op.like]: `%${search}%` } }
      ]
    }

    // Get customers without order count for now (simplified approach)
    const { count, rows: customers } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    // Get order counts separately with proper IN clause
    const customerIds = customers.map(c => c.id)
    const orderCounts = {}
    
    if (customerIds.length > 0) {
      const { Op, fn, col } = require('sequelize')
      const orderCountData = await Order.findAll({
        attributes: [
          'UserId',
          [fn('COUNT', col('id')), 'count']
        ],
        where: {
          UserId: { [Op.in]: customerIds }
        },
        group: ['UserId'],
        raw: true
      })
      
      orderCountData.forEach(item => {
        orderCounts[item.UserId] = parseInt(item.count, 10)
      })
    }

    // Add order counts to customers
    const customersWithOrders = customers.map(customer => ({
      ...customer.toJSON(),
      totalOrders: orderCounts[customer.id] || 0
    }))

    const totalPages = Math.ceil(count / limit)

    return res.json({
      customers: customersWithOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (err) {
    console.error("Get customers error:", err)
    return res.status(500).json({ message: "Failed to fetch customers" })
  }
}

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query
    
    const user = await User.findOne({ 
      where: { emailVerificationToken: token } 
    })
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" })
    }
    
    await user.update({ 
      isEmailVerified: true, 
      emailVerificationToken: null 
    })
    
    return res.json({ message: "Email verified successfully" })
  } catch (err) {
    console.error("Email verification error:", err)
    return res.status(500).json({ message: "Failed to verify email" })
  }
}

// Forgot password - send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    
    await user.update({
      passwordResetToken: otp,
      passwordResetExpires: otpExpiry
    })
    
    const emailSent = await sendPasswordResetOTP(email, otp, user.name)
    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send OTP" })
    }
    
    return res.json({ message: "OTP sent to your email" })
  } catch (err) {
    console.error("Forgot password error:", err)
    return res.status(500).json({ message: "Failed to process forgot password request" })
  }
}

// Reset password with OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    
    const user = await User.findOne({ 
      where: { 
        email,
        passwordResetToken: otp,
        passwordResetExpires: { [require('sequelize').Op.gt]: new Date() }
      }
    })
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" })
    }
    
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await user.update({
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null
    })
    
    return res.json({ message: "Password reset successfully" })
  } catch (err) {
    console.error("Reset password error:", err)
    return res.status(500).json({ message: "Failed to reset password" })
  }
}

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user.sub
    console.log("userId:", userId)
    console.log("Request body:", req.body)

    const { name, username, phoneNumber, address } = req.body || {}
    
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    // Check if username is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ 
        where: { 
          username, 
          id: { [require('sequelize').Op.ne]: userId } 
        } 
      })
      if (existingUser) {
        return res.status(409).json({ message: "Username already in use" })
      }
    }
    
    // Check if phone number is already taken by another user
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const existingUser = await User.findOne({ 
        where: { 
          phoneNumber, 
          id: { [require('sequelize').Op.ne]: userId } 
        } 
      })
      if (existingUser) {
        return res.status(409).json({ message: "Phone number already in use" })
      }
    }
    
    await user.update({
      name: name || user.name,
      username: username || user.username,
      phoneNumber: phoneNumber || user.phoneNumber,
      address: address || user.address
    })
    
    return res.json({ 
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profilePhoto: user.profilePhoto,
        role: user.role
      }
    })
  } catch (err) {
    console.error("Update profile error:", err)
    // Surface Sequelize errors so UI can show useful feedback
    if (err?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: err.errors?.[0]?.message || 'Duplicate value' })
    }
    if (err?.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: err.errors?.[0]?.message || 'Validation failed' })
    }
    return res.status(500).json({ message: "Failed to update profile" })
  }
}

// Upload profile photo
exports.uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id || req.user.sub
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }
    
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    // Upload to Cloudinary
    const uploadResult = await uploadImage(req.file, 'readpage/profiles')
    
    if (!uploadResult.success) {
      return res.status(500).json({ message: "Failed to upload image" })
    }
    
    // Delete old profile photo if exists
    if (user.profilePhoto) {
      try {
        const prev = typeof user.profilePhoto === 'string' ? JSON.parse(user.profilePhoto) : user.profilePhoto
        if (prev?.public_id) {
          await require('../utils/cloudinaryService').deleteImage(prev.public_id)
        }
      } catch {}
    }
    
    // Store JSON { url, public_id }
    const photoJson = JSON.stringify({ url: uploadResult.url, public_id: uploadResult.public_id })
    await user.update({ profilePhoto: photoJson })
    
    return res.json({ 
      message: "Profile photo updated successfully",
      profilePhoto: uploadResult.url
    })
  } catch (err) {
    console.error("Upload profile photo error:", err)
    return res.status(500).json({ message: "Failed to upload profile photo" })
  }
}

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id || req.user.sub
    const { currentPassword, newPassword } = req.body
    
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!validPassword) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await user.update({ passwordHash })
    
    return res.json({ message: "Password changed successfully" })
  } catch (err) {
    console.error("Change password error:", err)
    return res.status(500).json({ message: "Failed to change password" })
  }
}



