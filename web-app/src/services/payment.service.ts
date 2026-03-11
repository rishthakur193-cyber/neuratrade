export class PaymentService {
  private static API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  /**
   * Load Razorpay Checkout Script
   */
  static loadRazorpay(): Promise<boolean> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  static async initiatePayment(amount: number, planId?: string, advisorId?: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.API_URL}/payments/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount, planId, advisorId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to initiate payment');
    }

    return await response.json();
  }

  /**
   * Alias for initiatePayment for subscription intent
   */
  static async createSubscriptionIntent(userId: string, planName: string, amount: number) {
    return this.initiatePayment(amount, planName);
  }

  /**
   * Verify payment signature
   */
  static async verifyPayment(paymentDetails: any) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.API_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentDetails)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment verification failed');
    }

    return await response.json();
  }
}
