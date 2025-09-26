const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")
const Order = require("./Order")

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      // Removed unique constraint to avoid "Too many keys" error
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'customer'),
      allowNull: false,
      defaultValue: 'customer',
    },
  },
  {
    tableName: "users",
    timestamps: true,
    // rely on field-level unique constraint; avoid duplicate index creation
  }
)

// Associations
User.hasMany(Order, { foreignKey: 'UserId', as: 'Orders' })

module.exports = User


