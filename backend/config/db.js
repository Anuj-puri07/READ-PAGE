const dotenv = require("dotenv")
dotenv.config()

const { Sequelize } = require("sequelize")

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT,
  }
)

;(async () => {
  try {
    await sequelize.authenticate()
    console.log("Database connected successfully")
  } catch (err) {
    console.error("Database connection failed:", err)
  }
})()

module.exports = sequelize
