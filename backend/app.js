const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const path = require("path")

dotenv.config()

const sequelize = require("./config/db")
const seedAdmin = require("./seed/adminSeed")
const updateUserModel = require("./migrations/updateUserModel")

const app = express()

app.use(cors())
app.use(express.json())

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.get("/", (req, res) => {
  res.send("ReadPage API is running")
})

app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/books", require("./routes/bookRoutes"))
app.use("/api/cart", require("./routes/cartRoutes"))
app.use("/api/orders", require("./routes/orderRoutes"))
app.use("/api/payments", require("./routes/paymentRoutes"))

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await sequelize.sync({ alter: true })
    console.log("Migrated successfully")
    
    // Run custom migration for user model updates
    await updateUserModel()
    
    await seedAdmin()
  } catch (e) {
    console.error('Startup failed:', e)
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()