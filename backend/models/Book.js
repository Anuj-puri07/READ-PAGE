const { DataTypes } = require("sequelize")
const sequelize = require("../config/db")

const Book = sequelize.define(
  "Book",
  {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    }, 
    title: { 
      type: DataTypes.STRING, 
      allowNull: false 
    }, 
    author: { 
      type: DataTypes.STRING, 
      allowNull: false 
    }, 
    description: { 
      type: DataTypes.TEXT 
    }, 
    price: { 
      type: DataTypes.FLOAT, 
      allowNull: false 
    }, 
    stock: { 
      type: DataTypes.INTEGER, 
      defaultValue: 0 
    }, 
    coverImage: { 
      type: DataTypes.JSON, 
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'General'
    }
  },
  {
    tableName: "books",
    timestamps: true
  }
)

module.exports = Book