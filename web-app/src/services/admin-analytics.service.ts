import { initDb } from '@/lib/db';

/**
 * Admin Analytics Service — Phase 5 of Admin Control Panel
 */

export class AdminAnalyticsService {
    /**
     * Get overall platform statistics.
     */
    static async getPlatformStats() {
        const db = await initDb();

        const [counts, revenue, subs] = await Promise.all([
            db.get('SELECT COUNT(*) as totalUsers FROM User'),
            db.get("SELECT COUNT(*) as activeSubs FROM AdvisorSubscription WHERE status = 'ACTIVE'"),
            db.get('SELECT COUNT(*) as totalAdvisors FROM AdvisorProfile')
        ]);

        const investors = await db.get('SELECT COUNT(*) as totalInvestors FROM InvestorProfile');

        // Mock revenue calculation: Sum of active subscription plans (assuming a price mapping)
        // In a real system, we'd sum actual transaction records.
        const estimatedMonthlyRevenue = (counts.totalUsers * 499); // Placeholder

        return {
            totalUsers: counts.totalUsers,
            totalInvestors: investors.totalInvestors,
            totalAdvisors: subs.totalAdvisors,
            activeSubscriptions: revenue.activeSubs,
            monthlyRevenue: estimatedMonthlyRevenue,
            timestamp: new Date().toISOString()
        };
    }
}
