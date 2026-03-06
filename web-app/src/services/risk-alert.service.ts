/**
 * Risk Alert Service — Module 4
 *
 * Generates investor risk alerts when their followed advisor's strategy
 * is mismatched with current market conditions.
 *
 * Example: Advisor uses low-volatility swing strategy, but VIX is at 22.
 */

import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import { StrategyEnvironmentService, type StrategyType } from './strategy-environment.service';
import type { MarketCondition } from './market-data.service';

export interface RiskAlert {
    id: string;
    investorId: string;
    advisorId?: string;
    advisorName?: string;
    alertType: 'STRATEGY_MISMATCH' | 'HIGH_VOLATILITY_WARNING' | 'SECTOR_RISK' | 'DRAWDOWN_WARNING';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    message: string;
    marketCondition: string;
    advisorStrategy?: string;
    isRead: boolean;
    createdAt: string;
}

const SEVERITY_COLOR: Record<RiskAlert['severity'], string> = {
    LOW: '#90CAF9',
    MEDIUM: '#FFD740',
    HIGH: '#FF9800',
    CRITICAL: '#FF5252',
};

const MISMATCH_THRESHOLD = 45; // Score below this triggers a mismatch alert

// ─── Mock alerts ──────────────────────────────────────────────────────────────

function getMockAlerts(condition: MarketCondition): RiskAlert[] {
    const now = new Date().toISOString();
    const alerts: RiskAlert[] = [];

    if (condition === 'HIGH_VOLATILITY') {
        alerts.push({
            id: randomUUID(), investorId: 'mock-investor',
            advisorId: 'mock-1', advisorName: 'Arvind Mehta CFA',
            alertType: 'STRATEGY_MISMATCH', severity: 'HIGH',
            message: 'India VIX is at elevated levels. Your advisor (Arvind Mehta CFA) uses positional strategies that perform poorly in high-volatility markets. Consider reducing position sizes.',
            marketCondition: condition, advisorStrategy: 'POSITIONAL',
            isRead: false, createdAt: now,
        });
        alerts.push({
            id: randomUUID(), investorId: 'mock-investor',
            alertType: 'HIGH_VOLATILITY_WARNING', severity: 'CRITICAL',
            message: 'Market volatility is extreme. Stop-losses may get triggered unexpectedly. Avoid leveraged positions. Ensure your advisor has updated stop-loss levels.',
            marketCondition: condition,
            isRead: false, createdAt: now,
        });
    }

    if (condition === 'TRENDING_DOWN') {
        alerts.push({
            id: randomUUID(), investorId: 'mock-investor',
            advisorId: 'mock-4', advisorName: 'Sunita Patel',
            alertType: 'STRATEGY_MISMATCH', severity: 'MEDIUM',
            message: 'Broad market is in a downtrend. Your advisor (Sunita Patel) primarily recommends long swing trades. Current conditions may result in lower-than-expected returns.',
            marketCondition: condition, advisorStrategy: 'SWING',
            isRead: false, createdAt: now,
        });
    }

    if (alerts.length === 0) {
        alerts.push({
            id: randomUUID(), investorId: 'mock-investor',
            alertType: 'STRATEGY_MISMATCH', severity: 'LOW',
            message: 'Current market conditions are broadly aligned with your advisor\'s strategy. No significant mismatch detected. Continue monitoring.',
            marketCondition: condition,
            isRead: false, createdAt: now,
        });
    }

    return alerts;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class RiskAlertService {

    /** Generate and persist mismatch alerts for an investor */
    static async generateAlertsForInvestor(
        investorId: string,
        condition: MarketCondition,
    ): Promise<RiskAlert[]> {
        const db = await initDb();
        const alerts: RiskAlert[] = [];
        const now = new Date().toISOString();

        // Get investor's linked advisors
        let advisorLinks: any[] = [];
        try {
            advisorLinks = await db.all(`
        SELECT ac.advisorId, u.name as advisorName, asd.primaryStrategy
          FROM AdvisorClient ac
          JOIN AdvisorProfile ap ON ac.advisorId = ap.id
          JOIN User u ON ap.userId = u.id
          LEFT JOIN AdvisorStrategyDNA asd ON asd.advisorId = ap.id
         WHERE ac.investorId = ? AND ac.status = 'ACTIVE'
      `, [investorId]);
        } catch { /* table may not exist yet */ }

        for (const link of advisorLinks) {
            const strategy = link.primaryStrategy ?? 'SWING';
            const strategyType = strategy.toUpperCase() as StrategyType;
            const score = StrategyEnvironmentService.getStrategyScore(strategyType, condition);

            if (score < MISMATCH_THRESHOLD) {
                const severity: RiskAlert['severity'] = score < 30 ? 'CRITICAL' : score < 40 ? 'HIGH' : 'MEDIUM';
                const alert: RiskAlert = {
                    id: randomUUID(),
                    investorId,
                    advisorId: link.advisorId,
                    advisorName: link.advisorName,
                    alertType: 'STRATEGY_MISMATCH',
                    severity,
                    message: `Current market is ${condition.replace(/_/g, ' ')}. Your advisor (${link.advisorName}) uses ${strategy} strategies which score only ${score}/100 in these conditions. Consider reducing exposure or requesting updated guidance.`,
                    marketCondition: condition,
                    advisorStrategy: strategy,
                    isRead: false,
                    createdAt: now,
                };
                alerts.push(alert);

                try {
                    await db.run(
                        `INSERT INTO InvestorRiskAlert
               (id, investorId, advisorId, alertType, severity, message, marketCondition, advisorStrategy)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [alert.id, investorId, link.advisorId, alert.alertType, alert.severity, alert.message, condition, strategy]
                    );
                } catch { /* non-fatal */ }
            }
        }

        // High-volatility global alert
        if (condition === 'HIGH_VOLATILITY') {
            const alert: RiskAlert = {
                id: randomUUID(),
                investorId, alertType: 'HIGH_VOLATILITY_WARNING', severity: 'HIGH',
                message: 'India VIX is elevated. All multi-day positions carry higher overnight risk. Ensure stop-losses are in place.',
                marketCondition: condition, isRead: false, createdAt: now,
            };
            alerts.push(alert);
        }

        return alerts.length > 0 ? alerts : getMockAlerts(condition);
    }

    /** Get active alerts for an investor from DB */
    static async getActiveAlerts(investorId: string): Promise<RiskAlert[]> {
        try {
            const db = await initDb();
            const rows = await db.all(
                `SELECT * FROM InvestorRiskAlert
          WHERE investorId = ? AND isRead = 0
          ORDER BY createdAt DESC LIMIT 10`,
                [investorId]
            );
            return rows as RiskAlert[];
        } catch {
            return [];
        }
    }

    /** Get severity color for UI badge */
    static getSeverityColor(severity: RiskAlert['severity']): string {
        return SEVERITY_COLOR[severity];
    }

    static getMockAlerts = getMockAlerts;
}
