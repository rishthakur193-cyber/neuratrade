/**
 * Broker Registry — Broker Integration Layer
 *
 * Central registry for all broker connectors.
 * To add a new broker: implement IBrokerConnector, import it here, add to REGISTRY.
 *
 * ADDITIVE: new file, no existing code modified.
 */

import { ZerodhaBrokerConnector } from './zerodha.broker';
import { AngelOneBrokerConnector } from './angelone.broker';
import { UpstoxBrokerConnector } from './upstox.broker';
import type {
    IBrokerConnector, BrokerName, BrokerSession, BrokerPortfolio,
    BrokerTradeHistory, AdvisorPerformanceVerification,
} from './broker.interface';

export type { BrokerName, BrokerSession, BrokerPortfolio, BrokerTradeHistory, AdvisorPerformanceVerification };
export type { IBrokerConnector };

// ─── Registry ────────────────────────────────────────────────────────────────

const REGISTRY: Record<BrokerName, IBrokerConnector> = {
    ZERODHA: new ZerodhaBrokerConnector(),
    ANGELONE: new AngelOneBrokerConnector(),
    UPSTOX: new UpstoxBrokerConnector(),
};

export interface BrokerSummary {
    broker: BrokerName;
    displayName: string;
    logoUrl: string;
    isConfigured: boolean;
    connectUrl?: string;
}

// ─── Service ────────────────────────────────────────────────────────────────

export class BrokerRegistryService {

    /** List all registered brokers with their status */
    static getAllBrokers(): BrokerSummary[] {
        return (Object.keys(REGISTRY) as BrokerName[]).map(name => {
            const c = REGISTRY[name];
            const connectUrls: Record<BrokerName, string | undefined> = {
                ZERODHA: `https://kite.zerodha.com/connect/login?api_key=${process.env.ZERODHA_API_KEY}&v=3`,
                ANGELONE: undefined, // MPIN-based, no OAuth redirect
                UPSTOX: `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${process.env.UPSTOX_API_KEY}&redirect_uri=${process.env.UPSTOX_REDIRECT_URI}`,
            };
            return { broker: name, displayName: c.displayName, logoUrl: c.logoUrl, isConfigured: c.isConfigured, connectUrl: connectUrls[name] };
        });
    }

    /** Get a specific broker connector */
    static getConnector(broker: BrokerName): IBrokerConnector {
        const connector = REGISTRY[broker];
        if (!connector) throw new Error(`Broker ${broker} is not registered`);
        return connector;
    }

    /** Connect to a broker and get a session */
    static async connect(broker: BrokerName, credentials: Parameters<IBrokerConnector['connect']>[0]): Promise<BrokerSession> {
        return REGISTRY[broker].connect(credentials);
    }

    /** Fetch portfolio from a connected broker */
    static async getPortfolio(broker: BrokerName, accessToken: string, clientId: string): Promise<BrokerPortfolio> {
        return REGISTRY[broker].getPortfolio(accessToken, clientId);
    }

    /** Fetch trade history from a connected broker */
    static async getTradeHistory(broker: BrokerName, accessToken: string, clientId: string, days?: number): Promise<BrokerTradeHistory> {
        return REGISTRY[broker].getTradeHistory(accessToken, clientId, days);
    }

    /** Verify an advisor's performance from broker data */
    static async verifyAdvisorPerformance(broker: BrokerName, advisorClientId: string, accessToken: string): Promise<AdvisorPerformanceVerification> {
        return REGISTRY[broker].verifyAdvisorPerformance(advisorClientId, accessToken);
    }

    /** Fetch portfolios from ALL connected brokers (for a multi-broker investor) */
    static async getAllPortfolios(connections: { broker: BrokerName; accessToken: string; clientId: string }[]): Promise<BrokerPortfolio[]> {
        return Promise.all(connections.map(c => REGISTRY[c.broker].getPortfolio(c.accessToken, c.clientId)));
    }

    /** Compute portfolio health score: 0–100 */
    static computePortfolioHealth(portfolio: BrokerPortfolio): {
        healthScore: number; riskExposure: string; diversificationScore: number;
        recommendations: string[];
    } {
        const { holdings, totalPnl, totalValue } = portfolio;
        const pnlPct = totalValue ? (totalPnl / totalValue) * 100 : 0;

        // Concentration: top holding weight
        const topWeight = holdings.length
            ? Math.max(...holdings.map(h => (h.currentPrice * h.quantity) / totalValue)) * 100
            : 100;

        const lossPositions = holdings.filter(h => h.pnl < 0).length;

        let health = 60;
        if (pnlPct > 5) health += 15;
        if (pnlPct < -10) health -= 20;
        if (topWeight < 30) health += 10;
        if (topWeight > 50) health -= 15;
        if (holdings.length >= 6) health += 10;
        if (lossPositions > holdings.length / 2) health -= 10;

        const divScore = Math.max(10, Math.min(100, Math.round(100 - topWeight + holdings.length * 5)));
        const riskExposure = topWeight > 50 ? 'HIGH' : topWeight > 30 ? 'MEDIUM' : 'LOW';

        const recs: string[] = [];
        if (topWeight > 40) recs.push('Reduce concentration in top holding — diversify to 6+ positions');
        if (pnlPct < -5) recs.push('Review stop-loss placement — current drawdown exceeds 5%');
        if (holdings.length < 4) recs.push('Add more positions to improve diversification');
        if (lossPositions > holdings.length / 2) recs.push('Majority positions in loss — consider reviewing entry strategy');
        if (recs.length === 0) recs.push('Portfolio health is good — maintain current diversification strategy');

        return {
            healthScore: Math.max(5, Math.min(100, Math.round(health))),
            riskExposure, diversificationScore: divScore, recommendations: recs,
        };
    }
}
