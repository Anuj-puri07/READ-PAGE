import KhaltiCheckout from "khalti-checkout-web";
import { khaltiConfig } from "./khaltiConfig";
import { api } from "./api";

// This function is now deprecated in favor of using our backend API
// It's kept for reference but should not be used directly
export const initiateKhaltiPayment = (amount, orderId, onSuccess) => {
  console.warn("Direct Khalti payment initiation is deprecated. Use api.initiateKhaltiPayment instead.");
  
  // Configuration with dynamic amount and order details
  const config = {
    ...khaltiConfig,
    amount: amount * 100, // Convert to paisa (Khalti uses paisa)
    eventHandler: {
      ...khaltiConfig.eventHandler,
      onSuccess: async (payload) => {
        console.log("Payment Success:", payload);
        
        // Verify payment with backend
        try {
          const response = await api.verifyKhaltiPayment({
            token: payload.token,
            amount: payload.amount,
            orderId: orderId
          });
          
          if (response.status === "COMPLETED") {
            // Call the success callback if provided
            if (onSuccess && typeof onSuccess === 'function') {
              onSuccess(response);
            }
          }
          
          return response;
        } catch (error) {
          console.error("Payment verification failed:", error);
          throw error;
        }
      }
    }
  };

  // Initialize Khalti checkout
  const checkout = new KhaltiCheckout(config);
  
  // Open the payment widget
  checkout.show({ amount: config.amount });
  
  return checkout;
};

// Helper function to check payment status
export const checkPaymentStatus = async (orderId) => {
  try {
    const response = await api.getPaymentStatus(orderId);
    return response;
  } catch (error) {
    console.error("Error checking payment status:", error);
    throw error;
  }
};

export default { initiateKhaltiPayment, checkPaymentStatus };