import { initDb } from '@/lib/db';

export class AnalyticsService {
    /**
     * Calculates platform-wide or portfolio-specific Risk Metrics (VaR, Sharpe)
     */
    static async getPortfolioRisk(userId: string) {
        if (!userId) throw new Error("Missing user ID");

        const db = await initDb();
        const portfolio = await db.get('SELECT * FROM Portfolio WHERE userId = ?', [userId]);

        if (!portfolio || portfolio.totalValue === 0) {
            return {
                sharpeRatio: 0,
                var95: 0,
                beta: 0,
                drawdown: 0,
                message: "Insufficient portfolio data for risk analysis."
            };
        }

        // MOCK: Generates mathematical risk proxies based on invested vs total value mapping
        const returnPct = ((portfolio.totalValue - portfolio.investedAmount) / portfolio.investedAmount) * 100 || 0;

        const sharpeRatio = (returnPct - 7.0) / (Math.abs(returnPct) * 0.5 + 2); // Assuming 7% Risk-Free Rate
        const var95 = portfolio.totalValue * 0.082; // Mocking 8.2% max loss expected in worst 5% of days
        const beta = 1.15; // Mock relative market volatility
        const drawdown = returnPct < 0 ? Math.abs(returnPct) + 2 : 4.5;

        return {
            sharpeRatio: Number(sharpeRatio.toFixed(2)),
            var95: Number(var95.toFixed(2)),
            beta,
            maxDrawdown: Number(drawdown.toFixed(2))
        };
    }

    /**
     * Fetches the macro ecosystem insights for the dashboard
     */
    static async getMacroInsights() {
        // In production this would query the DB for aggregated sums
        return {
            totalEcosystemAUM: 4500000000, // 4,500 Cr
            activeAdvisors: 142,
            activeInvestors: 18540,
            averageAlpha: 14.3
        };
    }
}
