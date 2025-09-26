const Book = require("../models/Book")
const fs = require("fs")
const path = require("path")

// Create a new book
exports.createBook = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Cover image is required" })
    }

    const { title, author, description, price, stock, category } = req.body

    // Validate required fields
    if (!title || !author || !price) {
      // Remove uploaded file if validation fails
      fs.unlinkSync(req.file.path)
      return res.status(400).json({ message: "Title, author and price are required" })
    }

    // Create image data object
    const coverImage = {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    }

    // Create book in database
    const book = await Book.create({
      title,
      author,
      description: description || "",
      price: parseFloat(price),
      stock: stock ? parseInt(stock) : 0,
      category: category || 'General',
      coverImage
    })

    res.status(201).json(book)
  } catch (err) {
    // Clean up file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path)
    }
    console.error("Create book error:", err)
    res.status(500).json({ message: "Failed to create book" })
  }
}

// Get all books
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      order: [['createdAt', 'DESC']]
    })
    res.json(books)
  } catch (err) {
    console.error("Get books error:", err)
    res.status(500).json({ message: "Failed to fetch books", error: err.message })
  }
}

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id)
    if (!book) {
      return res.status(404).json({ message: "Book not found" })
    }
    res.json(book)
  } catch (err) {
    console.error("Get book error:", err)
    res.status(500).json({ message: "Failed to fetch book" })
  }
}

// Update book
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id)
    if (!book) {
      // Remove uploaded file if book not found
      if (req.file) {
        fs.unlinkSync(req.file.path)
      }
      return res.status(404).json({ message: "Book not found" })
    }

    const { title, author, description, price, stock, category } = req.body
    
    // Update book data
    const updateData = {
      title: title || book.title,
      author: author || book.author,
      description: description !== undefined ? description : book.description,
      price: price ? parseFloat(price) : book.price,
      stock: stock !== undefined ? parseInt(stock) : book.stock,
      category: category || book.category
    }

    // Update cover image if new file was uploaded
    if (req.file) {
      // Delete old image file if it exists (handle JSON stored as string or object)
      try {
        const oldCover = typeof book.coverImage === 'string' ? JSON.parse(book.coverImage) : book.coverImage
        if (oldCover?.path) {
          const oldImagePath = path.join(__dirname, "../uploads", path.basename(oldCover.path))
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath)
          }
        }
      } catch (e) {
        // ignore parse or fs errors when removing old image
      }

      // Create new image data
      updateData.coverImage = {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    }

    // Update book in database
    await book.update(updateData)
    
    res.json(await book.reload())
  } catch (err) {
    // Clean up file if there's an error
    if (req.file) {
      fs.unlinkSync(req.file.path)
    }
    console.error("Update book error:", err)
    res.status(500).json({ message: "Failed to update book" })
  }
}

// Delete book
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id)
    if (!book) {
      return res.status(404).json({ message: "Book not found" })
    }

    // Delete image file (handle JSON stored as string or object)
    try {
      const cover = typeof book.coverImage === 'string' ? JSON.parse(book.coverImage) : book.coverImage
      if (cover?.path) {
        const imagePath = path.join(__dirname, "../uploads", path.basename(cover.path))
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
        }
      }
    } catch (e) {
      // ignore parse or fs errors when removing image
    }

    // Delete book from database
    await book.destroy()
    
    res.json({ message: "Book deleted successfully" })
  } catch (err) {
    console.error("Delete book error:", err)
    res.status(500).json({ message: "Failed to delete book" })
  }
}