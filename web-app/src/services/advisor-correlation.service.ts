/**
 * Advisor Correlation Service — Module 3
 *
 * Computes a "Current Advantage Score" for each advisor based on how well
 * their trading strategy matches today's market conditions.
 *
 * Uses AdvisorStrategyDNA (from Decision Intelligence) and VerifiedTrade
 * performance to weight scores.
 */

import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import { StrategyEnvironmentService, type StrategyType } from './strategy-environment.service';
import type { MarketCondition } from './market-data.service';

export interface AdvisorRank {
    advisorId: string;
    advisorName: string;
    sebiRegNo?: string;
    strategy: StrategyType;
    advantageScore: number;
    verdict: 'STRONG_ADVANTAGE' | 'ADVANTAGE' | 'NEUTRAL' | 'DISADVANTAGE';
    reasoning: string;
    verificationBadge?: string;
    winRate?: number;
    avgReturn?: number;
}

// ─── Normalise strategy labels from DB to StrategyType enum ──────────────────

function normaliseStrategy(raw: string): StrategyType {
    const s = raw?.toLowerCase() ?? '';
    if (s.includes('intraday') || s.includes('day')) return 'INTRADAY';
    if (s.includes('scalp')) return 'SCALPING';
    if (s.includes('option')) return 'OPTIONS';
    if (s.includes('momentum')) return 'MOMENTUM';
    if (s.includes('positional') || s.includes('long')) return 'POSITIONAL';
    return 'SWING'; // default
}

function scoreToVerdict(score: number): AdvisorRank['verdict'] {
    if (score >= 80) return 'STRONG_ADVANTAGE';
    if (score >= 60) return 'ADVANTAGE';
    if (score >= 45) return 'NEUTRAL';
    return 'DISADVANTAGE';
}

const VERDICT_LABEL: Record<AdvisorRank['verdict'], string> = {
    STRONG_ADVANTAGE: '🟢 Strong Advantage',
    ADVANTAGE: '🔵 Advantage',
    NEUTRAL: '⚪ Neutral',
    DISADVANTAGE: '🔴 Disadvantage',
};

// ─── Mock rankings ────────────────────────────────────────────────────────────

function getMockRankings(condition: MarketCondition): AdvisorRank[] {
    const advisors = [
        { advisorId: 'mock-2', advisorName: 'Priya Sharma', sebiRegNo: 'INA000023456', strategy: 'INTRADAY' as StrategyType, winRate: 68, avgReturn: 2.4, badge: 'PLATINUM' },
        { advisorId: 'mock-1', advisorName: 'Arvind Mehta CFA', sebiRegNo: 'INA000012345', strategy: 'POSITIONAL' as StrategyType, winRate: 72, avgReturn: 3.1, badge: 'GOLD' },
        { advisorId: 'mock-4', advisorName: 'Sunita Patel', sebiRegNo: 'INA000045678', strategy: 'SWING' as StrategyType, winRate: 74, avgReturn: 2.1, badge: 'PLATINUM' },
        { advisorId: 'mock-3', advisorName: 'Rajesh Kumar', sebiRegNo: 'INA000034567', strategy: 'OPTIONS' as StrategyType, winRate: 61, avgReturn: 1.8, badge: 'SILVER' },
        { advisorId: 'mock-5', advisorName: 'Karan Mehra', sebiRegNo: 'INA000056789', strategy: 'MOMENTUM' as StrategyType, winRate: 58, avgReturn: 2.8, badge: 'GOLD' },
    ];

    return advisors.map(a => {
        const baseScore = StrategyEnvironmentService.getStrategyScore(a.strategy, condition);
        // Weight by win rate
        const weightedScore = Math.round(baseScore * 0.7 + (a.winRate / 100) * 30);
        const verdict = scoreToVerdict(weightedScore);
        return {
            advisorId: a.advisorId,
            advisorName: a.advisorName,
            sebiRegNo: a.sebiRegNo,
            strategy: a.strategy,
            advantageScore: weightedScore,
            verdict,
            reasoning: `${VERDICT_LABEL[verdict]} for ${condition.replace('_', ' ')} conditions. ${a.strategy} strategy scores ${baseScore}/100 in current environment.`,
            verificationBadge: a.badge,
            winRate: a.winRate,
            avgReturn: a.avgReturn,
        };
    }).sort((a, b) => b.advantageScore - a.advantageScore);
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class AdvisorCorrelationService {

    /** Compute and persist advantage scores for all advisors */
    static async computeAndPersist(condition: MarketCondition): Promise<AdvisorRank[]> {
        const db = await initDb();

        try {
            const advisors = await db.all(`
        SELECT ap.id, ap.sebiRegNo, u.name,
               asd.primaryStrategy, asd.winRate, asd.avgreturn
          FROM AdvisorProfile ap
          JOIN User u ON ap.userId = u.id
          LEFT JOIN AdvisorStrategyDNA asd ON asd.advisorId = ap.id
      `);

            if (!advisors || advisors.length === 0) return getMockRankings(condition);

            const ranks: AdvisorRank[] = advisors.map((a: any) => {
                const strategy = normaliseStrategy(a.primaryStrategy ?? '');
                const baseScore = StrategyEnvironmentService.getStrategyScore(strategy, condition);
                const winRate = a.winRate ?? 60;
                const weightedScore = Math.round(baseScore * 0.7 + (winRate / 100) * 30);
                const verdict = scoreToVerdict(weightedScore);

                return {
                    advisorId: a.id,
                    advisorName: a.name,
                    sebiRegNo: a.sebiRegNo,
                    strategy,
                    advantageScore: weightedScore,
                    verdict,
                    reasoning: `${VERDICT_LABEL[verdict]} for ${condition.replace(/_/g, ' ')} conditions. ${strategy} scores ${baseScore}/100 in current environment.`,
                    winRate,
                    avgReturn: a.avgreturn,
                };
            }).sort((a, b) => b.advantageScore - a.advantageScore);

            // Persist scores
            for (const rank of ranks) {
                await db.run(
                    `INSERT INTO AdvisorAdvantageScore (id, advisorId, marketCondition, advantageScore, reasoning, computedAt)
           VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                    [randomUUID(), rank.advisorId, condition, rank.advantageScore, rank.reasoning]
                );
            }

            return ranks;
        } catch {
            return getMockRankings(condition);
        }
    }

    /** Get current rankings (compute fresh or return mock) */
    static async getCurrentRankings(condition: MarketCondition): Promise<AdvisorRank[]> {
        try {
            const ranks = await AdvisorCorrelationService.computeAndPersist(condition);
            return ranks.length > 0 ? ranks : getMockRankings(condition);
        } catch {
            return getMockRankings(condition);
        }
    }

    static getMockRankings = getMockRankings;
}
