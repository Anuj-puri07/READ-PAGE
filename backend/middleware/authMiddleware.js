const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Verify JWT token
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const user = await User.findByPk(decoded.sub)
    if (!user) {
      return res.status(401).json({ message: "Invalid token" })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}