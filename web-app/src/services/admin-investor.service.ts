import { initDb } from '@/lib/db';

/**
 * Admin Investor Service — Phase 3 of Admin Control Panel
 */

export class AdminInvestorService {
    /**
     * List all investors.
     */
    static async listAllInvestors() {
        const db = await initDb();
        return db.all(`
      SELECT ip.*, u.name, u.email, u.kycStatus
      FROM InvestorProfile ip
      JOIN User u ON ip.userId = u.id
      ORDER BY u.createdAt DESC
    `);
    }

    /**
     * Get active subscriptions for a specific investor.
     */
    static async getInvestorSubscriptions(investorId: string) {
        const db = await initDb();
        return db.all(`
      SELECT s.*, a.name as advisorName
      FROM AdvisorSubscription s
      JOIN AdvisorProfile ap ON s.advisorId = ap.id
      JOIN User a ON ap.userId = a.id
      WHERE s.investorId = ?
    `, [investorId]);
    }

    /**
     * Manually activate/deactivate a subscription.
     */
    static async toggleSubscription(subscriptionId: string, status: 'ACTIVE' | 'CANCELLED') {
        const db = await initDb();
        await db.run(
            'UPDATE AdvisorSubscription SET status = ? WHERE id = ?',
            [status, subscriptionId]
        );
        return { success: true, message: `Subscription ${status}` };
    }
}
