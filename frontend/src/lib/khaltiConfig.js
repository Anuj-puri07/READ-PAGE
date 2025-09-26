// Khalti configuration file
// Replace these with your actual Khalti keys
export const khaltiConfig = {
  publicKey: `key e51a944f468a4c62961d15771f60059d`, // Replace with your public key
  productIdentity: "RMP-Book-Store",
  productName: "ReadPage Book Store",
  productUrl: "http://localhost:5173",
  eventHandler: {
    onSuccess: function (payload) {
      // Handle success
      console.log("Payment Success:", payload);
      return payload;
    },
    onError: function (error) {
      // Handle error
      console.log("Payment Error:", error);
      return error;
    },
    onClose: function () {
      console.log("Payment widget closed");
    }
  }
};

export default khaltiConfig;