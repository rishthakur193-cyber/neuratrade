/**
 * Recovery Metrics Service — Module 8
 *
 * Tracks investor recovery success over time:
 *   - Monthly drawdown %
 *   - Discipline score
 *   - Profitable trade count
 *   - Confidence index (rolling)
 */

import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export interface MonthlyMetric {
    id: string;
    userId: string;
    month: string;
    drawdownPct: number;
    disciplineScore: number;
    profitableTrades: number;
    totalTrades: number;
    winRate: number;
    confidenceIndex: number;
    recordedAt: string;
}

export interface RecoverySummary {
    userId: string;
    latestConfidenceIndex: number;
    confidenceTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    avgDrawdown: number;
    bestMonth: string;
    totalProfitableMonths: number;
    disciplineImprovement: number;
    overallProgress: number; // 0–100
    metrics: MonthlyMetric[];
    milestones: string[];
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

function getMockMetrics(userId: string): MonthlyMetric[] {
    return [
        { id: 'm1', userId, month: 'Jan 2026', drawdownPct: 18.2, disciplineScore: 42, profitableTrades: 3, totalTrades: 8, winRate: 37, confidenceIndex: 28, recordedAt: '2026-01-31' },
        { id: 'm2', userId, month: 'Feb 2026', drawdownPct: 11.4, disciplineScore: 58, profitableTrades: 5, totalTrades: 9, winRate: 55, confidenceIndex: 44, recordedAt: '2026-02-28' },
        { id: 'm3', userId, month: 'Mar 2026', drawdownPct: 6.8, disciplineScore: 72, profitableTrades: 7, totalTrades: 11, winRate: 63, confidenceIndex: 68, recordedAt: '2026-03-05' },
    ];
}

function getMockSummary(userId: string): RecoverySummary {
    const metrics = getMockMetrics(userId);
    return {
        userId, latestConfidenceIndex: 68, confidenceTrend: 'IMPROVING',
        avgDrawdown: 12.1, bestMonth: 'Mar 2026', totalProfitableMonths: 1,
        disciplineImprovement: 30, overallProgress: 62,
        metrics,
        milestones: [
            '✅ Completed all learning modules',
            '✅ First paper trade placed',
            '✅ 10 simulation trades completed',
            '🔄 Aim for 55%+ win rate to unlock Stage 3',
        ],
    };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class RecoveryMetricsService {

    static async recordMonthly(userId: string, data: Omit<MonthlyMetric, 'id' | 'userId' | 'winRate' | 'recordedAt'>): Promise<void> {
        const winRate = data.totalTrades > 0
            ? Math.round((data.profitableTrades / data.totalTrades) * 100)
            : 0;
        try {
            const db = await initDb();
            await db.run(
                `INSERT INTO RecoveryMetric
           (id, userId, month, drawdownPct, disciplineScore, profitableTrades, totalTrades, confidenceIndex)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [randomUUID(), userId, data.month, data.drawdownPct, data.disciplineScore,
                data.profitableTrades, data.totalTrades, data.confidenceIndex]
            );
            // Update RecoveryProgress discipline score
            await db.run(
                'UPDATE RecoveryProgress SET disciplineScore = ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ?',
                [data.disciplineScore, userId]
            );
        } catch { /* non-fatal */ }
    }

    static async getSummary(userId: string): Promise<RecoverySummary> {
        try {
            const db = await initDb();
            const rows: any[] = await db.all(
                'SELECT * FROM RecoveryMetric WHERE userId = ? ORDER BY recordedAt ASC LIMIT 12',
                [userId]
            );
            if (!rows || rows.length === 0) return getMockSummary(userId);

            const metrics: MonthlyMetric[] = rows.map(r => ({
                ...r, winRate: r.totalTrades > 0 ? Math.round((r.profitableTrades / r.totalTrades) * 100) : 0,
            }));

            const latest = metrics[metrics.length - 1];
            const earliest = metrics[0];
            const avgDraw = Math.round(metrics.reduce((s, m) => s + m.drawdownPct, 0) / metrics.length * 10) / 10;
            const profMonths = metrics.filter(m => m.winRate >= 50).length;
            const discImprove = latest.disciplineScore - earliest.disciplineScore;
            const trend: RecoverySummary['confidenceTrend'] = discImprove > 5 ? 'IMPROVING' : discImprove < -5 ? 'DECLINING' : 'STABLE';
            const progress = Math.min(100, Math.round((latest.confidenceIndex / 100) * 100));
            const best = [...metrics].sort((a, b) => b.winRate - a.winRate)[0]?.month ?? 'N/A';

            const milestones: string[] = [
                '✅ Recovery profile created',
                metrics.length >= 1 ? '✅ First month tracked' : '🔄 Complete month 1',
                profMonths >= 1 ? '✅ First profitable month' : '🔄 Reach first profitable month',
                profMonths >= 2 ? '✅ 2 profitable months' : '🔄 Reach 2 profitable months',
            ];

            return {
                userId, latestConfidenceIndex: latest.confidenceIndex,
                confidenceTrend: trend, avgDrawdown: avgDraw,
                bestMonth: best, totalProfitableMonths: profMonths,
                disciplineImprovement: discImprove, overallProgress: progress,
                metrics, milestones,
            };
        } catch {
            return getMockSummary(userId);
        }
    }

    static getMockMetrics = getMockMetrics;
    static getMockSummary = getMockSummary;
}
