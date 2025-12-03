
// This service handles interactions with the payment backend.
// It is structured to call standard REST endpoints.

const API_BASE = '/api/payment'; // In production, this would be your actual backend URL

interface PaymentResult {
  success: boolean;
  message?: string;
  transactionId?: string;
}

export const PaymentService = {
  // Create a PaymentIntent on the server
  createPaymentIntent: async (amount: number, currency: string = 'usd'): Promise<string> => {
    try {
      // In a real app, this fetch would hit your backend
      // const response = await fetch(`${API_BASE}/create-intent`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount, currency })
      // });
      // if (!response.ok) throw new Error('Network response was not ok');
      // const data = await response.json();
      // return data.clientSecret;

      // For this demo (since we don't have a real node backend running), we simulate a successful server response
      console.log(`[PaymentAPI] POST /create-intent { amount: ${amount}, currency: ${currency} }`);
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
      
      // Return a mock secret that would come from Stripe
      return "pi_live_" + Math.random().toString(36).substr(2, 18);

    } catch (error) {
      console.error("Payment Service Error:", error);
      throw error;
    }
  },

  // Confirm the card payment
  confirmPayment: async (clientSecret: string, cardDetails: any): Promise<PaymentResult> => {
    try {
      console.log(`[PaymentAPI] POST /confirm-payment`, { clientSecret, cardLast4: cardDetails.number.slice(-4) });
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      // Basic client-side validation before sending to "server"
      if (!cardDetails.number || cardDetails.number.length < 10) {
          return { success: false, message: "Invalid Card Number" };
      }

      return { 
          success: true, 
          transactionId: "tx_" + Math.random().toString(36).substr(2, 9) 
      };
    } catch (error) {
      return { success: false, message: "Transaction failed due to network error." };
    }
  },

  // Subscribe a user to a plan
  subscribeToPlan: async (planId: string, userId: string): Promise<PaymentResult> => {
      try {
        console.log(`[PaymentAPI] POST /subscribe { planId: ${planId}, userId: ${userId} }`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true, transactionId: "sub_" + Math.random().toString(36).substr(2, 9) };
      } catch (error) {
        return { success: false, message: "Subscription failed." };
      }
  },

  // Connect a Creator's bank account via Stripe Connect
  connectExpressAccount: async (userId: string): Promise<string> => {
      console.log(`[PaymentAPI] GET /connect/oauth?userId=${userId}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return "https://connect.stripe.com/express/onboarding/mock_token";
  }
};
