const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 },
    },
    paymentMethod: {
      type: DataTypes.ENUM("khalti", "cod"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "COMPLETED", "FAILED", "CANCELLED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pidx: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('paymentDetails');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('paymentDetails', value ? JSON.stringify(value) : null);
      }
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    OrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id'
      }
    }
  },
  {
    timestamps: true,
  }
);

module.exports = Payment;