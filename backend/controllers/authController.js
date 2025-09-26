const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")
const User = require("../models/User")
const Order = require("../models/Order")
const { verifyToken, isAdmin } = require("../middleware/authMiddleware")

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

exports.register = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { name, email, password } = req.body
  try {
    const existing = await User.findOne({ where: { email } })
    if (existing) {
      return res.status(409).json({ message: "Email already in use" })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash, role: 'customer' })
    const token = signToken(user)
    return res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
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
    const token = signToken(user)
    return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token })
  } catch (err) {
    console.error("Login error:", err)
    return res.status(500).json({ message: "Internal server error" })
  }
}

// Get current user profile with their orders
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.sub
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

    // Get order counts separately
    const customerIds = customers.map(c => c.id)
    const orderCounts = {}
    
    if (customerIds.length > 0) {
      const orderCountData = await Order.findAll({
        attributes: [
          'UserId',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        where: {
          UserId: customerIds
        },
        group: ['UserId'],
        raw: true
      })
      
      orderCountData.forEach(item => {
        orderCounts[item.UserId] = parseInt(item.count)
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



