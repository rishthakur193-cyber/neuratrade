const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface SubscriptionInput {
  advisorId: string;
  plan: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}

export class SubscriptionService {
  /**
   * Create a new advisor subscription.
   */
  static async createSubscription(token: string, input: SubscriptionInput): Promise<any> {
    const response = await fetch(`${BASE_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to create subscription');
    return result;
  }

  /**
   * Fetch active subscriptions for an investor.
   */
  static async getInvestorSubscriptions(token: string): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/subscriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to fetch subscriptions');
    return result;
  }

  /**
   * Check if an investor is subscribed to an advisor.
   */
  static async isSubscribed(token: string, advisorId: string): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/subscriptions/check/${advisorId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to check subscription');
    return result.isSubscribed;
  }
}
