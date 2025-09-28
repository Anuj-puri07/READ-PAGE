const Order = require("../models/Order")
const Book = require("../models/Book")
const CartItem = require("../models/CartItem")
const User = require("../models/User")
const sequelize = require("../config/db")
const axios = require("axios")


// exports.create = async (req, res) => {
//   try {
//     const { bookId, quantity = 1, paymentMethod } = req.body || {}
//     if (!bookId || !paymentMethod) {
//       return res.status(400).json({ message: "bookId and paymentMethod are required" })
//     }

//     const qty = Math.max(1, parseInt(quantity))

//     const book = await Book.findByPk(bookId)
//     if (!book) return res.status(404).json({ message: "Book not found" })

//     const totalAmount = parseFloat(book.price) * qty

//     const order = await Order.create({
//       UserId: req.user.id,
//       BookId: book.id,
//       quantity: qty,
//       totalAmount,
//       paymentMethod: paymentMethod === 'cod' ? 'cod' : 'khalti',
//       paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
//       deliveryStatus: 'pending',
//     })

//     // If payment method is khalti, initiate payment automatically
//     if (paymentMethod === 'khalti') {
//       try {
//         // Call the payment initiation API internally
//         const paymentResponse = await axios.post(
//           `${req.protocol}://${req.get('host')}/api/payments/khalti/initiate`,
//           { orderId: order.id },
//           { 
//             headers: { 
//               Authorization: req.headers.authorization 
//             }
//           }
//         );
        
//         // Return payment URL and order info
//         return res.status(201).json({
//           order,
//           paymentUrl: paymentResponse.data.paymentUrl,
//           message: "Order created successfully. Redirecting to payment.",
//           requiresPayment: true
//         });
//       } catch (paymentError) {
//         console.error('Payment initiation error:', paymentError);
//         return res.status(201).json({
//           order,
//           message: "Order created successfully, but payment initiation failed. Please try payment again.",
//           requiresPayment: true
//         });
//       }
//     }

//     return res.status(201).json({
//       order,
//       message: "Order created successfully with cash on delivery."
//     })
//   } catch (err) {
//     console.error('Create order error:', err)
//     return res.status(500).json({ message: 'Failed to create order' })
//   }
// }

// Create orders from cart items
// Expected body: { cartItemIds: number[], paymentMethod: 'cod' | 'khalti' }
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
    let totalOrderAmount = 0
    
    for (const item of cartItems) {
      const totalAmount = parseFloat(item.Book.price) * item.quantity
      totalOrderAmount += totalAmount
      
      const order = await Order.create({
        UserId: req.user.id,
        BookId: item.Book.id,
        quantity: item.quantity,
        totalAmount,
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'khalti',
        paymentStatus: 'pending',
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
    
    // If payment method is khalti, initiate payment automatically
    if (paymentMethod === 'khalti') {
      try {
        // Use the first order ID for payment initiation
        const firstOrderId = orders[0].id;
        
        // Call the payment initiation API internally
        const paymentResponse = await axios.post(
          `${req.protocol}://${req.get('host')}/api/payments/khalti/initiate`,
          { orderId: firstOrderId },
          { 
            headers: { 
              Authorization: req.headers.authorization 
            }
          }
        );
        
        // Return payment URL and order info
        return res.status(201).json({
          orders,
          totalAmount: totalOrderAmount,
          paymentUrl: paymentResponse.data.paymentUrl,
          message: "Orders created successfully. Redirecting to payment.",
          requiresPayment: true
        });
      } catch (paymentError) {
        console.error('Payment initiation error:', paymentError);
        return res.status(201).json({
          orders,
          totalAmount: totalOrderAmount,
          message: "Orders created successfully, but payment initiation failed. Please try payment again.",
          requiresPayment: true
        });
      }
    }
    
    return res.status(201).json({
      orders,
      message: "Orders created successfully with cash on delivery."
    })
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



