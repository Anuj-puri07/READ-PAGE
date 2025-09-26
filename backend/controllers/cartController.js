const CartItem = require("../models/CartItem")
const Book = require("../models/Book")

// Get current user's cart with book details
exports.list = async (req, res) => {
  try {
    // Set up association for this query
    CartItem.belongsTo(Book, { foreignKey: 'BookId' })
    
    const items = await CartItem.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Book }],
      order: [["createdAt", "DESC"]],
    })
    res.json(items)
  } catch (err) {
    console.error("Cart list error:", err)
    res.status(500).json({ message: "Failed to fetch cart" })
  }
}

// Add a book to cart or increase quantity
exports.add = async (req, res) => {
  try {
    console.log('Cart add request body:', req.body)
    const { bookId, quantity } = req.body || {}
    if (!bookId) {
      return res.status(400).json({ message: 'bookId is required' })
    }
    const qty = Math.max(1, parseInt(quantity || 1))

    const book = await Book.findByPk(bookId)
    if (!book) return res.status(404).json({ message: "Book not found" })

    const [item, created] = await CartItem.findOrCreate({
      where: { UserId: req.user.id, BookId: bookId },
      defaults: { quantity: qty },
    })
    if (!created) {
      item.quantity += qty
      await item.save()
    }
    res.status(created ? 201 : 200).json(item)
  } catch (err) {
    console.error("Cart add error:", err)
    res.status(500).json({ message: "Failed to add to cart" })
  }
}

// Update quantity for a cart item
exports.update = async (req, res) => {
  try {
    const { quantity } = req.body
    const qty = Math.max(1, parseInt(quantity))
    const item = await CartItem.findOne({ where: { id: req.params.id, UserId: req.user.id } })
    if (!item) return res.status(404).json({ message: "Cart item not found" })
    item.quantity = qty
    await item.save()
    res.json(item)
  } catch (err) {
    console.error("Cart update error:", err)
    res.status(500).json({ message: "Failed to update cart" })
  }
}

// Remove one item from cart
exports.remove = async (req, res) => {
  try {
    const item = await CartItem.findOne({ where: { id: req.params.id, UserId: req.user.id } })
    if (!item) return res.status(404).json({ message: "Cart item not found" })
    await item.destroy()
    res.json({ message: "Removed from cart" })
  } catch (err) {
    console.error("Cart remove error:", err)
    res.status(500).json({ message: "Failed to remove from cart" })
  }
}

// Clear entire cart
exports.clear = async (req, res) => {
  try {
    await CartItem.destroy({ where: { UserId: req.user.id } })
    res.json({ message: "Cart cleared" })
  } catch (err) {
    console.error("Cart clear error:", err)
    res.status(500).json({ message: "Failed to clear cart" })
  }
}


