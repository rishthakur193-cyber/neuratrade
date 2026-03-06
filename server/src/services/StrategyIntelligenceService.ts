import prisma from '../lib/prisma.js';

export type StrategyType = 'INTRADAY' | 'SWING' | 'POSITIONAL' | 'OPTIONS' | 'MOMENTUM' | 'SCALPING';

export interface StrategyRankEntry {
    rank: number;
    strategyType: StrategyType;
    score: number;
    trend: 'HOT' | 'RISING' | 'STABLE' | 'COOLING' | 'WEAK';
    label: string;
    advisorCount: number;
    avgWinRate: number;
    marketConditionFit: string;
    icon: string;
    color: string;
}

const CONDITION_SCORES: Record<string, Partial<Record<StrategyType, number>>> = {
    HIGH_VOLATILITY: { INTRADAY: 92, OPTIONS: 85, SCALPING: 80, MOMENTUM: 62, SWING: 55, POSITIONAL: 38 },
    TRENDING_UP: { MOMENTUM: 90, SWING: 85, POSITIONAL: 78, INTRADAY: 65, OPTIONS: 60, SCALPING: 50 },
    TRENDING_DOWN: { OPTIONS: 88, INTRADAY: 72, SCALPING: 68, SWING: 52, MOMENTUM: 40, POSITIONAL: 35 },
    RANGING: { SWING: 82, SCALPING: 75, OPTIONS: 70, INTRADAY: 60, MOMENTUM: 48, POSITIONAL: 45 },
    SECTOR_ROTATION: { POSITIONAL: 85, SWING: 78, MOMENTUM: 72, INTRADAY: 58, OPTIONS: 55, SCALPING: 40 },
};

const STRATEGY_META: Record<StrategyType, { icon: string; label: string }> = {
    INTRADAY: { icon: '⚡', label: 'Intraday Trading' },
    SWING: { icon: '🌊', label: 'Swing Trading' },
    POSITIONAL: { icon: '🏗️', label: 'Positional Trading' },
    OPTIONS: { icon: '🎯', label: 'Options Trading' },
    MOMENTUM: { icon: '🚀', label: 'Momentum Trading' },
    SCALPING: { icon: '⚔️', label: 'Scalping' },
};

const TREND_MAP = (score: number): StrategyRankEntry['trend'] =>
    score >= 80 ? 'HOT' : score >= 65 ? 'RISING' : score >= 50 ? 'STABLE' : score >= 35 ? 'COOLING' : 'WEAK';

const TREND_COLORS: Record<string, string> = {
    HOT: '#FF5252', RISING: '#FF9800', STABLE: '#FFD740', COOLING: '#78909c', WEAK: '#546e7a',
};

export class StrategyIntelligenceService {
    static async getIntelligence() {
        // In a real scenario, this might fetch from a market data provider
        const condition = 'HIGH_VOLATILITY';

        const scores = CONDITION_SCORES[condition] || CONDITION_SCORES.HIGH_VOLATILITY;
        const strategies: StrategyType[] = ['INTRADAY', 'OPTIONS', 'SWING', 'POSITIONAL', 'MOMENTUM', 'SCALPING'];

        const rankings: StrategyRankEntry[] = strategies.map((s, i) => {
            const score = scores[s] || 50;
            const trend = TREND_MAP(score);
            const meta = STRATEGY_META[s];
            return {
                rank: 0,
                strategyType: s,
                score,
                trend,
                label: meta.label,
                icon: meta.icon,
                advisorCount: 5, // Simplified for now
                avgWinRate: 65,
                marketConditionFit: `Good fit for ${condition} conditions`,
                color: TREND_COLORS[trend]
            };
        }).sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 }));

        return {
            rankings,
            marketCondition: condition,
            generatedAt: new Date().toISOString()
        };
    }
}
