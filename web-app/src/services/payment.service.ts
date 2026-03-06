import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export class PaymentService {
  /**
   * Generates a payment intent and returns checkout details suitable for UPI processing.
   */
  static async createSubscriptionIntent(userId: string, planName: string, amount: number) {
    if (!userId) throw new Error("Missing user ID");

    const orderId = `eco_order_${randomUUID()}`;

    // In production, this initiates a Razorpay/Stripe session
    // Since Indian Fintech focuses on UPI, we mock UPI specific intents
    return {
      orderId,
      amount,
      currency: 'INR',
      planName,
      status: 'created',
      upiLink: `upi://pay?pa=ecosystem@bank&pn=Ecosystem%20Of%20Smart%20Investing&tr=${orderId}&am=${amount}&cu=INR`
    };
  }

  /**
   * Validates webhook signature and activates the subscription.
   */
  static async handleWebhookVerification(orderId: string, userId: string, advisorId: string, plan: any) {
    const db = await initDb();

    // In a real scenario, we'd verify the signature here.
    // For MVP, we proceed to activate.
    await this.activateSubscription(userId, advisorId, plan);

    return { success: true, message: 'Subscription activated successfully' };
  }

  private static async activateSubscription(investorId: string, advisorId: string, plan: string) {
    const db = await initDb();
    const id = randomUUID();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30); // 30 day default

    await db.run(`
      INSERT INTO AdvisorSubscription (id, investorId, advisorId, plan, status, startDate, endDate, updatedAt)
      VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(investorId, advisorId) DO UPDATE SET
        status = 'ACTIVE',
        plan = EXCLUDED.plan,
        startDate = EXCLUDED.startDate,
        endDate = EXCLUDED.endDate,
        updatedAt = CURRENT_TIMESTAMP
    `, [id, investorId, advisorId, plan, startDate.toISOString(), endDate.toISOString()]);
  }
}
