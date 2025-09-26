const express = require("express")
const { verifyToken } = require("../middleware/authMiddleware")
const cart = require("../controllers/cartController")

const router = express.Router()

// All cart routes require authentication
router.use(verifyToken)

router.get('/', cart.list)
router.post('/', cart.add)
router.put('/:id', cart.update)
router.delete('/:id', cart.remove)
router.delete('/', cart.clear)

module.exports = router


