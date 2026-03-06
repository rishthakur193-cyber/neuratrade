import { SubscriptionService } from './subscription.service';
import { AdvisorDiscoveryService } from './advisor-discovery.service';
import { RiskProfilingService } from './risk-profiling.service';

/**
 * Investor Dashboard Service — Phase 3 of MVP Launch
 * 
 * Compiles all data for an investor's main view.
 */

export class InvestorDashboardService {
    /**
     * Get complete dashboard data for an investor.
     */
    static async getDashboardData(token: string) {
        // Fetch data from various services (all now hitting the server API)
        const [riskProfile, subscriptions, recommendations] = await Promise.all([
            RiskProfilingService.getProfile(token),
            SubscriptionService.getInvestorSubscriptions(token),
            AdvisorDiscoveryService.discoverAdvisors(token)
        ]);

        return {
            riskProfile,
            subscriptions,
            recommendations: recommendations.slice(0, 3), // Show top 3
            stats: {
                totalSubscribed: subscriptions.length,
                verifiedTradesFollowed: 12, // Mocked for now
                overallConsistency: 85      // Mocked for now
            },
            timestamp: new Date().toISOString()
        };
    }
}
