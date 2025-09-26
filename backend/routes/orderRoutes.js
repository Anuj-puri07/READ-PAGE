const express = require('express')
const { verifyToken, isAdmin } = require('../middleware/authMiddleware')
const order = require('../controllers/orderController')

const router = express.Router()

router.use(verifyToken)

// User routes
router.get('/', order.list)
router.post('/', order.create)
router.post('/from-cart', order.createFromCart)

// Admin routes
router.patch('/:id/status', isAdmin, order.updateStatus)

module.exports = router


