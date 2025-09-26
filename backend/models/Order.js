const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, 
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 },
    },
    paymentMethod: {
      type: DataTypes.ENUM("cod", "online"),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      allowNull: false,
      defaultValue: "pending",
    },
    deliveryStatus: {
      type: DataTypes.ENUM("pending", "processing", "delivered", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    BookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      }
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
)

module.exports = Order


