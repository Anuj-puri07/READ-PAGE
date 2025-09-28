import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { checkPaymentStatus } from "../lib/khaltiService";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [message, setMessage] = useState("Verifying your payment status...");

  useEffect(() => {
    // Extract pidx from URL query parameters if available
    const queryParams = new URLSearchParams(location.search);
    const pidx = queryParams.get("pidx");
    const purchase_order_id = queryParams.get("purchase_order_id");
    
    const verifyPayment = async () => {
      try {
        setVerifying(true);
        
        // If we have a pidx, verify the payment
        if (pidx) {   
          const response = await api.verifyKhaltiPayment({ pidx });
          if (response && response.status === "COMPLETED") {
            setPaymentStatus("completed");
            setMessage("Thank you for purchasing via Khalti Payment Gateway! Your payment has been confirmed successfully.");
          } else {
            setPaymentStatus("failed");
            setMessage("We couldn't verify your payment. Please contact customer support.");
          }
        } 
        // If we have a purchase_order_id (payment ID), check the payment status
        else if (purchase_order_id) {
          const payment = await api.getPaymentById(purchase_order_id);
          if (payment && payment.status === "COMPLETED") {
            setPaymentStatus("completed");
            setMessage("Thank you for purchasing via Khalti Payment Gateway! Your payment has been confirmed successfully.");
          } else {
            // Try to get the order ID from the payment and check its status
            if (payment && payment.OrderId) {
              const orderStatus = await checkPaymentStatus(payment.OrderId);
              if (orderStatus && orderStatus.paymentStatus === "paid") {
                setPaymentStatus("completed");
                setMessage("Thank you for purchasing via Khalti Payment Gateway! Your payment has been confirmed successfully.");
              } else {
                setPaymentStatus("failed");
                setMessage("We couldn't verify your payment. Please contact customer support.");
              }
            } else {
              setPaymentStatus("failed");
              setMessage("We couldn't verify your payment. Please contact customer support.");
            }
          }
        } else {
          // No payment identifiers found
          setPaymentStatus("unknown");
          setMessage("We couldn't find your payment information. Please check your orders or contact customer support.");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setPaymentStatus("error");
        setMessage("An error occurred while verifying your payment. Please check your orders or contact customer support.");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();

    // Set a timer to redirect to home after 5 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, location.search]);

  const handleGoBack = () => {
    navigate("/");
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <div className="flex items-center justify-center mb-4">
          {verifying ? (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          ) : paymentStatus === "completed" ? (
            <div className="bg-green-100 p-3 rounded-full">
              <svg
                className="h-6 w-6 text-green-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          ) : (
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg
                className="h-6 w-6 text-yellow-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
            </div>
          )}
        </div>
        <h2 className="text-2xl font-semibold mb-2">
          {verifying ? "Verifying Payment" : paymentStatus === "completed" ? "Payment Completed" : "Payment Status"}
        </h2>
        <p className="text-gray-600 mb-4">
          {message}
        </p>
        <button
          onClick={handleGoBack}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
