const Order = require("../models/Order")
const Book = require("../models/Book")
const CartItem = require("../models/CartItem")
const User = require("../models/User")
const sequelize = require("../config/db")


exports.create = async (req, res) => {
  try {
    const { bookId, quantity = 1, paymentMethod } = req.body || {}
    if (!bookId || !paymentMethod) {
      return res.status(400).json({ message: "bookId and paymentMethod are required" })
    }

    const qty = Math.max(1, parseInt(quantity))

    const book = await Book.findByPk(bookId)
    if (!book) return res.status(404).json({ message: "Book not found" })

    const totalAmount = parseFloat(book.price) * qty

    const order = await Order.create({
      UserId: req.user.id,
      BookId: book.id,
      quantity: qty,
      totalAmount,
      paymentMethod: paymentMethod === 'cod' ? 'cod' : 'online',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      deliveryStatus: 'pending',
    })

    return res.status(201).json(order)
  } catch (err) {
    console.error('Create order error:', err)
    return res.status(500).json({ message: 'Failed to create order' })
  }
}

// Create orders from cart items
// Expected body: { cartItemIds: number[], paymentMethod: 'cod' | 'online' }
exports.createFromCart = async (req, res) => {
  const transaction = await sequelize.transaction()
  
  try {
    // Set up associations for this query
    CartItem.belongsTo(Book, { foreignKey: 'BookId' })
    
    const { cartItemIds, paymentMethod } = req.body || {}
    
    if (!cartItemIds || !Array.isArray(cartItemIds) || cartItemIds.length === 0) {
      return res.status(400).json({ message: "cartItemIds array is required" })
    }
    
    if (!paymentMethod) {
      return res.status(400).json({ message: "paymentMethod is required" })
    }

    // Find all cart items that belong to the user
    const cartItems = await CartItem.findAll({
      where: { 
        id: cartItemIds,
        UserId: req.user.id 
      },
      include: [{ model: Book }],
      transaction
    })

    if (cartItems.length === 0) {
      await transaction.rollback()
      return res.status(404).json({ message: "No valid cart items found" })
    }

    // Create an order for each cart item
    const orders = []
    for (const item of cartItems) {
      const totalAmount = parseFloat(item.Book.price) * item.quantity
      
      const order = await Order.create({
        UserId: req.user.id,
        BookId: item.Book.id,
        quantity: item.quantity,
        totalAmount,
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'online',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        deliveryStatus: 'pending',
      }, { transaction })
      
      orders.push(order)
    }

    // Remove the cart items that were converted to orders
    await CartItem.destroy({
      where: { 
        id: cartItemIds,
        UserId: req.user.id 
      },
      transaction
    })

    await transaction.commit()
    return res.status(201).json(orders)
  } catch (err) {
    await transaction.rollback()
    console.error('Create orders from cart error:', err)
    return res.status(500).json({ message: 'Failed to create orders from cart' })
  }
}

// List orders for current user (or all if admin)
exports.list = async (req, res) => {
  try {
    // Set up associations for this query
    Order.belongsTo(Book, { foreignKey: 'BookId' })
    Order.belongsTo(User, { foreignKey: 'UserId' })
    
    const where = req.user.role === 'admin' ? {} : { UserId: req.user.id }
    
    // Include User model for admin requests to get customer information
    const includeModels = req.user.role === 'admin' 
      ? [{ model: Book }, { model: User, attributes: ['id', 'name', 'email'] }]
      : [{ model: Book }]
    
    const orders = await Order.findAll({ 
      where, 
      include: includeModels, 
      order: [['createdAt', 'DESC']] 
    })
    return res.json(orders)
  } catch (err) {
    console.error('List orders error:', err)
    return res.status(500).json({ message: 'Failed to fetch orders' })
  }
}

// Admin: update statuses
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { paymentStatus, deliveryStatus } = req.body || {}
    const order = await Order.findByPk(id)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    const updates = {}
    if (paymentStatus) updates.paymentStatus = paymentStatus
    if (deliveryStatus) updates.deliveryStatus = deliveryStatus
    await order.update(updates)
    return res.json(order)
  } catch (err) {
    console.error('Update order status error:', err)
    return res.status(500).json({ message: 'Failed to update order' })
  }
}



