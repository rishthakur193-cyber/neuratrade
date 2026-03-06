// @ts-nocheck
/**
 * MODULE 7 — Risk Simulation Service
 *
 * Replays stored trade records to simulate historical performance
 * for a given principal amount.
 *
 * Output:
 *   Investment: ₹5,00,000
 *   Final Value: ₹7,20,000
 *   Max Drawdown: 9.5%
 *   Worst Month: -4.1%
 *   Best Month: +11.2%
 */

import { PerformanceTrackingService } from './performance-tracking.service';
import { AdvisorStrategyService } from './advisor-strategy.service';

export interface SimulationResult {
    advisorId: string;
    advisorName: string;
    principal: number;
    finalValue: number;
    absoluteReturn: number;
    percentReturn: number;
    maxDrawdown: number;
    worstMonth: number;
    bestMonth: number;
    avgMonthlyReturn: number;
    monthlyEquityCurve: { month: string; value: number; return: number }[];
    sharpeRatio: number;
    calmarRatio: number;
    riskAdjustedNote: string;
}

const MONTHS_12 = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

export class RiskSimulationService {
    /**
     * Simulate 12-month performance for given principal + advisorId.
     * Uses real trade records if available; falls back to mock DNA stats.
     */
    static async simulate(
        advisorId: string,
        principal: number,
        useMock = false
    ): Promise<SimulationResult> {
        // Get advisor name
        let advisorName = 'Unknown Advisor';
        if (useMock) {
            const mockSet = AdvisorStrategyService.getMockDNASet();
            const found = mockSet.find(d => d.advisorId === advisorId);
            advisorName = found?.advisorName ?? advisorName;
        }

        // Get monthly returns — prefer real stats, fallback to mock
        let monthlyReturns: number[];
        let stats;

        if (useMock) {
            stats = PerformanceTrackingService.getMockStats(advisorId);
        } else {
            stats = await PerformanceTrackingService.getStats(advisorId);
            if (stats.totalTrades === 0) {
                stats = PerformanceTrackingService.getMockStats(advisorId);
            }
        }

        monthlyReturns = stats.monthlyBreakdown.map(m => m.return);

        // Simulate equity curve
        let equity = principal;
        let peak = principal;
        let maxDD = 0;
        const curve: SimulationResult['monthlyEquityCurve'] = [];

        for (let i = 0; i < 12; i++) {
            const r = monthlyReturns[i] ?? 0;
            equity *= (1 + r / 100);
            if (equity > peak) peak = equity;
            const dd = ((peak - equity) / peak) * 100;
            if (dd > maxDD) maxDD = dd;
            curve.push({
                month: MONTHS_12[i],
                value: Math.round(equity),
                return: r,
            });
        }

        const worstMonth = Math.min(...monthlyReturns);
        const bestMonth = Math.max(...monthlyReturns);
        const avgMonthly = monthlyReturns.reduce((a, b) => a + b, 0) / monthlyReturns.length;
        const finalValue = Math.round(equity);
        const absoluteReturn = finalValue - principal;
        const percentReturn = ((finalValue - principal) / principal) * 100;

        // Sharpe Ratio (simplified: annualised return / annualised std dev, assuming Rf = 6%)
        const std = Math.sqrt(monthlyReturns.reduce((acc, r) => acc + Math.pow(r - avgMonthly, 2), 0) / 12);
        const annualisedReturn = ((1 + avgMonthly / 100) ** 12 - 1) * 100;
        const sharpe = std > 0 ? (annualisedReturn - 6) / (std * Math.sqrt(12)) : 0;

        // Calmar = annualised return / max drawdown
        const calmar = maxDD > 0 ? annualisedReturn / maxDD : 0;

        const riskNote =
            sharpe > 1.5 ? 'Excellent risk-adjusted returns (Sharpe > 1.5)' :
                sharpe > 1.0 ? 'Good risk-adjusted returns (Sharpe > 1.0)' :
                    sharpe > 0.5 ? 'Moderate risk-adjusted returns — evaluate carefully' :
                        'Below-average risk-adjusted returns — exercise caution';

        return {
            advisorId,
            advisorName,
            principal,
            finalValue,
            absoluteReturn,
            percentReturn: Math.round(percentReturn * 100) / 100,
            maxDrawdown: Math.round(maxDD * 10) / 10,
            worstMonth: Math.round(worstMonth * 10) / 10,
            bestMonth: Math.round(bestMonth * 10) / 10,
            avgMonthlyReturn: Math.round(avgMonthly * 100) / 100,
            monthlyEquityCurve: curve,
            sharpeRatio: Math.round(sharpe * 100) / 100,
            calmarRatio: Math.round(calmar * 100) / 100,
            riskAdjustedNote: riskNote,
        };
    }
}

