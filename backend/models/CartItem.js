const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const CartItem = sequelize.define(
  "CartItem",
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
    tableName: "cart_items",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["UserId", "BookId"] },
    ],
  }
)

module.exports = CartItem


