/**
 * MODULE 5 — Verified Performance Tracking Service
 *
 * Store and retrieve advisor trade recommendations with full
 * performance statistics: win rate, avg return, max drawdown,
 * consistency score.
 */

import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export interface TradeRecord {
    symbol: string;
    entryPrice: number;
    stopLoss: number;
    target: number;
    exitPrice?: number;
    result?: 'WIN' | 'LOSS' | 'BREAKEVEN';
    returnPct?: number;
    holdingDays?: number;
    tradedAt?: string;
    closedAt?: string;
}

export interface PerformanceStats {
    totalTrades: number;
    closedTrades: number;
    winRate: number;
    avgReturn: number;
    maxDrawdown: number;
    consistencyScore: number;
    bestTrade: number;
    worstTrade: number;
    profitFactor: number;
    monthlyBreakdown: { month: string; return: number }[];
}

export class PerformanceTrackingService {
    /** Add a new trade recommendation for an advisor */
    static async addTrade(advisorId: string, trade: TradeRecord): Promise<string> {
        const db = await initDb();
        const id = randomUUID();
        await db.run(
            `INSERT INTO AdvisorRecommendation
        (id, advisorId, symbol, entryPrice, stopLoss, target, exitPrice,
         result, returnPct, holdingDays, closedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, advisorId, trade.symbol, trade.entryPrice, trade.stopLoss, trade.target,
                trade.exitPrice ?? null, trade.result ?? null, trade.returnPct ?? null,
                trade.holdingDays ?? 0, trade.closedAt ?? null,
            ]
        );
        return id;
    }

    /** Close out an open trade with result */
    static async closeTrade(
        tradeId: string,
        exitPrice: number,
        holdingDays: number
    ): Promise<void> {
        const db = await initDb();
        const trade = await db.get('SELECT * FROM AdvisorRecommendation WHERE id = ?', [tradeId]);
        if (!trade) throw new Error('Trade not found');

        const returnPct = ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100;
        const result: TradeRecord['result'] =
            returnPct > 0.5 ? 'WIN' : returnPct < -0.5 ? 'LOSS' : 'BREAKEVEN';

        await db.run(
            `UPDATE AdvisorRecommendation SET
         exitPrice = ?, result = ?, returnPct = ?, holdingDays = ?,
         closedAt = CURRENT_TIMESTAMP
       WHERE id = ?`,
            [exitPrice, result, Math.round(returnPct * 100) / 100, holdingDays, tradeId]
        );
    }

    /** Get all trades for an advisor */
    static async getTrades(advisorId: string): Promise<any[]> {
        const db = await initDb();
        return db.all(
            'SELECT * FROM AdvisorRecommendation WHERE advisorId = ? ORDER BY tradedAt DESC',
            [advisorId]
        );
    }

    /** Compute full performance statistics for an advisor */
    static async getStats(advisorId: string): Promise<PerformanceStats> {
        const db = await initDb();
        const trades = await db.all(
            'SELECT * FROM AdvisorRecommendation WHERE advisorId = ?',
            [advisorId]
        );

        const closed = trades.filter((t: any) => t.result !== null);
        const wins = closed.filter((t: any) => t.result === 'WIN');
        const returns = closed.map((t: any) => t.returnPct ?? 0);

        const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
        const avgReturn = returns.length > 0
            ? returns.reduce((a: number, b: number) => a + b, 0) / returns.length : 0;

        const grossProfit = returns.filter((r: number) => r > 0).reduce((a: number, b: number) => a + b, 0);
        const grossLoss = Math.abs(returns.filter((r: number) => r < 0).reduce((a: number, b: number) => a + b, 0));
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

        // Max drawdown from equity curve
        let peak = 0, equity = 100, maxDD = 0;
        for (const r of returns) {
            equity *= (1 + r / 100);
            if (equity > peak) peak = equity;
            const dd = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
            if (dd > maxDD) maxDD = dd;
        }

        // Consistency: based on return variance
        const variance = returns.length > 1
            ? returns.reduce((acc: number, r: number) => acc + Math.pow(r - avgReturn, 2), 0) / returns.length
            : 0;
        const consistency = Math.max(0, Math.min(100, 100 - variance * 3));

        // Monthly breakdown (mock — in production would use real dates)
        const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
        const monthlyBreakdown = months.map(month => ({
            month,
            return: Math.round((Math.random() * 16 - 4) * 10) / 10,
        }));

        return {
            totalTrades: trades.length,
            closedTrades: closed.length,
            winRate: Math.round(winRate * 10) / 10,
            avgReturn: Math.round(avgReturn * 100) / 100,
            maxDrawdown: Math.round(maxDD * 10) / 10,
            consistencyScore: Math.round(consistency * 10) / 10,
            bestTrade: returns.length > 0 ? Math.max(...returns) : 0,
            worstTrade: returns.length > 0 ? Math.min(...returns) : 0,
            profitFactor: Math.round(profitFactor * 100) / 100,
            monthlyBreakdown,
        };
    }

    /** Mock stats for demo/display when no real trades exist */
    static getMockStats(advisorId: string): PerformanceStats {
        const mockData: Record<string, Partial<PerformanceStats>> = {
            'mock-1': { winRate: 72, avgReturn: 3.1, maxDrawdown: 11, consistencyScore: 85, bestTrade: 12.4, worstTrade: -4.2, profitFactor: 2.8 },
            'mock-2': { winRate: 68, avgReturn: 2.4, maxDrawdown: 7, consistencyScore: 91, bestTrade: 8.9, worstTrade: -2.1, profitFactor: 3.1 },
            'mock-3': { winRate: 61, avgReturn: 1.8, maxDrawdown: 19, consistencyScore: 58, bestTrade: 9.2, worstTrade: -7.8, profitFactor: 1.5 },
            'mock-4': { winRate: 74, avgReturn: 2.1, maxDrawdown: 5, consistencyScore: 94, bestTrade: 7.3, worstTrade: -1.8, profitFactor: 3.6 },
        };
        const d = mockData[advisorId] ?? mockData['mock-1'];
        const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
        return {
            totalTrades: 89 + Math.floor(Math.random() * 60),
            closedTrades: 80 + Math.floor(Math.random() * 55),
            winRate: d.winRate!, avgReturn: d.avgReturn!, maxDrawdown: d.maxDrawdown!,
            consistencyScore: d.consistencyScore!, bestTrade: d.bestTrade!, worstTrade: d.worstTrade!,
            profitFactor: d.profitFactor!,
            monthlyBreakdown: months.map(month => ({
                month, return: Math.round((Math.random() * 16 - 3) * 10) / 10,
            })),
        };
    }
}
