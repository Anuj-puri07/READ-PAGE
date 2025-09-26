import KhaltiCheckout from "khalti-checkout-web";
import { khaltiConfig } from "./khaltiConfig";
import api from "./api";

export const initiateKhaltiPayment = (amount, orderId, onSuccess) => {
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
          
          if (response.success) {
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

export default { initiateKhaltiPayment };