const axios = require('axios');
const Order = require('../models/Order');

// Verify Khalti payment
const verifyKhaltiPayment = async (req, res) => {
  try {
    const { token, amount, orderId } = req.body;
    
    if (!token || !amount || !orderId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required parameters: token, amount, or orderId" 
      });
    }

    // Find the order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Verify with Khalti API
    const payload = {
      token: token,
      amount: amount
    };

    const config = {
      headers: {
        "Authorization": `Key ${process.env.KHALTI_SECRET_KEY}`
      }
    };

    // Make request to Khalti API
    const response = await axios.post(
      "https://a.khalti.com/api/v2/payment/verify/", 
      payload, 
      config
    );

    // If payment is verified
    if (response.data.idx) {
      // Update order payment status
      await order.update({
        paymentStatus: 'paid',
        paymentDetails: JSON.stringify(response.data)
      });

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: response.data
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }
  } catch (error) {
    console.error("Khalti verification error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.response?.data || error.message
    });
  }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paymentDetails: order.paymentDetails ? JSON.parse(order.paymentDetails) : null
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    return res.status(500).json({ message: "Failed to get payment status" });
  }
};

// Export the controller functions
module.exports = {
  verifyKhaltiPayment,
  getPaymentStatus
};