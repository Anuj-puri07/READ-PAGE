const axios = require("axios");
const Order = require("../models/Order");
const User = require("../models/User");
const Payment = require("../models/Payment");

// Environment variables
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_URL = "https://a.khalti.com";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000/";

// 1. Initiate Khalti Payment
const initiateKhaltiPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!orderId) {
      return res.status(400).json({ message: "Please provide orderId" });
    }

    // Find order and verify ownership
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order
    if (order.UserId !== userId) {
      return res.status(403).json({ message: "Unauthorized access to this order" });
    }

    // Check if order is already paid
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: "Order is already paid" });
    }

    // Create initial payment record
    const initialPayment = await Payment.create({
      OrderId: orderId,
      UserId: userId,
      amount: order.totalAmount,
      paymentMethod: "khalti",
      status: "PENDING",
    });

    // Convert amount to paisa (Khalti uses paisa)
    const amountInPaisa = order.totalAmount * 100;

    // Prepare payload for Khalti initiate
    const data = {
      return_url: `${FRONTEND_URL}/payment/success`,
      website_url: FRONTEND_URL,
      amount: amountInPaisa,
      purchase_order_id: initialPayment.id,
      purchase_order_name: `Order_${orderId}`,
      customer_info: {
        name: req.user.name || "Customer",
        email: req.user.email,
      }
    };

    const response = await axios.post(
      `${KHALTI_URL}/api/v2/epayment/initiate/`,
      data,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Update payment with pidx and payment URL
    await initialPayment.update({
      pidx: response.data.pidx,
      paymentUrl: response.data.payment_url,
      paymentDetails: {
        initiatedAt: new Date(),
        khaltiResponse: response.data
      }
    });

    // Update order payment status
    await order.update({
      paymentStatus: 'pending',
      paymentDetails: JSON.stringify({
        pidx: response.data.pidx,
        paymentUrl: response.data.payment_url,
        initiatedAt: new Date()
      })
    });

    return res.status(200).json({
      message: "Payment initiated successfully",
      paymentUrl: response.data.payment_url,
      pidx: response.data.pidx,
    });
  } catch (error) {
    console.error("Khalti initiate error:", error.response?.data || error.message);
    
    // Handle specific Khalti errors
    if (error.response?.data) {
      return res.status(400).json({
        message: "Payment initiation failed",
        error: error.response.data,
      });
    }

    return res.status(500).json({
      message: "Failed to initiate payment",
      error: error.message,
    });
  }
};

// 2. Verify Khalti payment by pidx
const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ message: "Missing pidx" });
    }

    // Find payment by pidx
    const payment = await Payment.findOne({
      where: { pidx: pidx }
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Verify payment with Khalti
    const response = await axios.post(
      `${KHALTI_URL}/api/v2/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paymentData = response.data;

    // Find order
    const order = await Order.findByPk(payment.OrderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found for this payment" });
    }

    // Update payment and order based on payment status
    switch (paymentData.status) {
      case "Completed":
        await payment.update({
          status: "COMPLETED",
          transactionId: paymentData.transaction_id,
          paymentDetails: {
            ...payment.paymentDetails,
            verifiedAt: new Date(),
            khaltiResponse: paymentData
          }
        });

        await order.update({
          paymentStatus: "paid",
          paymentMethod: "khalti",
          paymentDetails: JSON.stringify({
            ...JSON.parse(order.paymentDetails || '{}'),
            verifiedAt: new Date(),
            transactionId: paymentData.transaction_id
          })
        });

        return res.status(200).json({ 
          message: "Payment verified successfully", 
          status: "COMPLETED",
          data: paymentData 
        });

      case "Pending":
        return res.status(200).json({ 
          message: "Payment is pending", 
          status: "PENDING",
          data: paymentData 
        });

      case "Failed":
      case "Expired":
        await payment.update({
          status: "FAILED",
          paymentDetails: {
            ...payment.paymentDetails,
            verifiedAt: new Date(),
            khaltiResponse: paymentData
          }
        });

        await order.update({
          paymentStatus: "failed"
        });

        return res.status(400).json({ 
          message: `Payment ${paymentData.status.toLowerCase()}`, 
          status: "FAILED",
          data: paymentData 
        });

      default:
        return res.status(400).json({ 
          message: `Unknown payment status: ${paymentData.status}`,
          data: paymentData 
        });
    }

  } catch (error) {
    console.error("Khalti verify error:", error.response?.data || error.message);
    
    if (error.response?.data) {
      return res.status(400).json({
        message: "Payment verification failed",
        error: error.response.data,
      });
    }

    return res.status(500).json({
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// 3. Complete Khalti payment (callback from Khalti)
const completeKhaltiPayment = async (req, res) => {
  const { pidx, transaction_id, amount, purchase_order_id, status } = req.query;
  
  try {
    // Find payment by purchase_order_id
    const payment = await Payment.findByPk(purchase_order_id);
    
    if (!payment) {
      console.error("Payment not found:", purchase_order_id);
      return res.redirect(`${FRONTEND_URL}/payment/cancel`);
    }

    // Verify payment with Khalti
    const headers = {
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    const reqOptions = {
      url: `${KHALTI_URL}/api/v2/epayment/lookup/`,
      method: "POST",
      headers,
      data: JSON.stringify({ pidx }),
    };

    const paymentInfoResponse = await axios.request(reqOptions);
    const paymentInfo = paymentInfoResponse.data;

    if (!paymentInfo) {
      await payment.update({ status: "FAILED" });
      return res.redirect(`${FRONTEND_URL}/payment/cancel`);
    }

    // Find order
    const order = await Order.findByPk(payment.OrderId);
    if (!order) {
      console.error("Order not found for payment:", payment.id);
      return res.redirect(`${FRONTEND_URL}/payment/cancel`);
    }

    if (paymentInfo.status === "Completed") {
      // Update payment
      await payment.update({
        status: "COMPLETED",
        transactionId: transaction_id,
        paymentDetails: {
          ...payment.paymentDetails,
          completedAt: new Date(),
          khaltiResponse: paymentInfo
        }
      });

      // Update order
      await order.update({
        paymentStatus: "paid",
        paymentMethod: "khalti",
        paymentDetails: JSON.stringify({
          ...JSON.parse(order.paymentDetails || '{}'),
          completedAt: new Date(),
          transactionId: transaction_id
        })
      });

      return res.redirect(`${FRONTEND_URL}/payment/success`);
    } else if (paymentInfo.status === "User canceled") {
      await payment.update({ status: "CANCELLED" });
      return res.redirect(`${FRONTEND_URL}/payment/cancel`);
    } else {
      await payment.update({ status: "FAILED" });
      return res.redirect(`${FRONTEND_URL}/payment/cancel`);
    }
  } catch (error) {
    console.error("Complete payment error:", error);
    return res.redirect(`${FRONTEND_URL}/payment/cancel`);
  }
};

// 4. Get payment status for an order
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order
    if (order.UserId !== userId) {
      return res.status(403).json({ message: "Unauthorized access to this order" });
    }

    // Find payment for this order
    const payment = await Payment.findOne({
      where: { OrderId: orderId }
    });

    // Prepare response data
    const paymentInfo = {
      orderId: order.id,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paymentDetails: payment ? {
        id: payment.id,
        status: payment.status,
        method: payment.paymentMethod,
        transactionId: payment.transactionId,
        pidx: payment.pidx,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      } : null
    };

    return res.status(200).json(paymentInfo);
  } catch (error) {
    console.error("Get payment status error:", error);
    return res.status(500).json({ 
      message: "Failed to get payment status",
      error: error.message 
    });
  }
};

module.exports = {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  completeKhaltiPayment,
  getPaymentStatus,
};