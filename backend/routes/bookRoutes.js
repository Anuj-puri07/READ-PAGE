const express = require("express")
const bookController = require("../controllers/bookController")
const upload = require("../middleware/upload")
const { verifyToken, isAdmin } = require("../middleware/authMiddleware")

const router = express.Router()

// Public routes
router.get('/', bookController.getBooks)
router.get('/:id', bookController.getBookById)

// Admin-only routes with authentication
router.post('/', verifyToken, isAdmin, upload.single('coverImage'), bookController.createBook)
router.put('/:id', verifyToken, isAdmin, upload.single('coverImage'), bookController.updateBook)
router.delete('/:id', verifyToken, isAdmin, bookController.deleteBook)

module.exports = router