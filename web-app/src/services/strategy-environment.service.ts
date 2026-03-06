/**
 * Strategy Environment Analyzer — Module 2
 *
 * Maps current market condition to which advisor strategies are favored,
 * producing human-readable insights and strategy rankings.
 */

import type { MarketCondition, MarketSnapshot } from './market-data.service';

export type StrategyType = 'INTRADAY' | 'SWING' | 'POSITIONAL' | 'OPTIONS' | 'SCALPING' | 'MOMENTUM';

interface StrategyAdvantage {
    strategy: StrategyType;
    advantageScore: number; // 0–100
    verdict: 'STRONG_ADVANTAGE' | 'ADVANTAGE' | 'NEUTRAL' | 'DISADVANTAGE';
    reason: string;
}

interface EnvironmentInsight {
    marketCondition: MarketCondition;
    conditionLabel: string;
    primaryInsight: string;
    secondaryInsights: string[];
    strategyRankings: StrategyAdvantage[];
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
    riskColor: string;
    recommendedHoldingPeriod: string;
}

// ─── Condition → Strategy score matrix ───────────────────────────────────────

const STRATEGY_SCORES: Record<MarketCondition, Record<StrategyType, number>> = {
    HIGH_VOLATILITY: {
        INTRADAY: 92, SCALPING: 88, OPTIONS: 85,
        SWING: 40, MOMENTUM: 55, POSITIONAL: 30,
    },
    TRENDING_UP: {
        MOMENTUM: 95, POSITIONAL: 88, SWING: 75,
        INTRADAY: 55, OPTIONS: 45, SCALPING: 40,
    },
    TRENDING_DOWN: {
        OPTIONS: 90, SCALPING: 70, INTRADAY: 65,
        SWING: 35, MOMENTUM: 25, POSITIONAL: 20,
    },
    SECTOR_ROTATION: {
        POSITIONAL: 90, SWING: 80, MOMENTUM: 72,
        OPTIONS: 55, INTRADAY: 45, SCALPING: 35,
    },
    RANGING: {
        OPTIONS: 88, SWING: 80, SCALPING: 60,
        INTRADAY: 55, MOMENTUM: 35, POSITIONAL: 40,
    },
};

const STRATEGY_REASON: Record<MarketCondition, Record<StrategyType, string>> = {
    HIGH_VOLATILITY: {
        INTRADAY: 'Wide intraday ranges = more profit potential per trade',
        SCALPING: 'Frequent micro-swings create scalping opportunities',
        OPTIONS: 'Elevated IV increases option premium income',
        SWING: 'Overnight gaps create unpredictable risk',
        MOMENTUM: 'Momentum signals unreliable in choppy conditions',
        POSITIONAL: 'Multi-day exposure high risk in volatile market',
    },
    TRENDING_UP: {
        MOMENTUM: 'Strong directional bias — buy dips strategy works',
        POSITIONAL: 'Sustained uptrend rewards patient holders',
        SWING: 'Multi-day swings align with the broad trend',
        INTRADAY: 'Intraday gains capped by trending close',
        OPTIONS: 'IV crush reduces option premium after trend confirmation',
        SCALPING: 'Low volatility within trend limits scalping opportunities',
    },
    TRENDING_DOWN: {
        OPTIONS: 'Long puts and protective hedges pay well',
        SCALPING: 'Short-side scalping works in regular pullbacks',
        INTRADAY: 'Short-bias intraday trades profitable',
        SWING: 'Swing longs risky against downtrend',
        MOMENTUM: 'Downward momentum works but requires short access',
        POSITIONAL: 'Long positional very risky in downtrend',
    },
    SECTOR_ROTATION: {
        POSITIONAL: 'Identify rotating sectors early for multi-week holds',
        SWING: 'Sector-specific swings produce 3–7 day opportunities',
        MOMENTUM: 'Sector momentum builds within rotation window',
        OPTIONS: 'Sector ETF options work for targeted bets',
        INTRADAY: 'Broad market noise drowns sector signals intraday',
        SCALPING: 'Sector rotation is too slow for scalping time frame',
    },
    RANGING: {
        OPTIONS: 'Sell straddles/strangles — theta decay max in range',
        SWING: 'Buy support / sell resistance with defined risk',
        SCALPING: 'Predictable oscillations support scalping',
        INTRADAY: 'Moderate intraday ranges, less directional conviction',
        MOMENTUM: 'Momentum signals break down in ranging market',
        POSITIONAL: 'Positional lacks clear directional edge',
    },
};

function scoreToVerdict(score: number): StrategyAdvantage['verdict'] {
    if (score >= 80) return 'STRONG_ADVANTAGE';
    if (score >= 60) return 'ADVANTAGE';
    if (score >= 45) return 'NEUTRAL';
    return 'DISADVANTAGE';
}

const PRIMARY_INSIGHTS: Record<MarketCondition, string> = {
    HIGH_VOLATILITY: 'High volatility detected — intraday and options strategies are favored. Avoid multi-day positional exposure.',
    TRENDING_UP: 'Market trending bullish — momentum and positional strategies are rewarded. Ride the trend, avoid counter-trend trades.',
    TRENDING_DOWN: 'Broad market under pressure — defensive options strategies and short-bias intraday favored. Protect capital.',
    SECTOR_ROTATION: 'Sector rotation underway — capital moving between sectors. Positional sector-specific plays offer strong edge.',
    RANGING: 'Market in consolidation — options premium selling and mean-reversion swing trades are most effective.',
};

const RISK_LEVELS: Record<MarketCondition, { level: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'; color: string }> = {
    TRENDING_UP: { level: 'MODERATE', color: '#00E676' },
    RANGING: { level: 'LOW', color: '#90CAF9' },
    SECTOR_ROTATION: { level: 'MODERATE', color: '#7C4DFF' },
    HIGH_VOLATILITY: { level: 'HIGH', color: '#FFD740' },
    TRENDING_DOWN: { level: 'EXTREME', color: '#FF5252' },
};

const HOLDING_PERIODS: Record<MarketCondition, string> = {
    HIGH_VOLATILITY: 'Minutes to hours (intraday only)',
    TRENDING_UP: 'Days to weeks (swing/positional)',
    TRENDING_DOWN: 'Minutes to hours (short-side or hedge)',
    SECTOR_ROTATION: '1–3 weeks (sector positional)',
    RANGING: '1–5 days (bounded swing)',
};

// ─── Service ──────────────────────────────────────────────────────────────────

export class StrategyEnvironmentService {

    static analyzeEnvironment(snapshot: MarketSnapshot): EnvironmentInsight {
        const { marketCondition, vix, indices, sectors } = snapshot;
        const scores = STRATEGY_SCORES[marketCondition];

        const strategyRankings: StrategyAdvantage[] = (Object.keys(scores) as StrategyType[])
            .map(strategy => ({
                strategy,
                advantageScore: scores[strategy],
                verdict: scoreToVerdict(scores[strategy]),
                reason: STRATEGY_REASON[marketCondition][strategy],
            }))
            .sort((a, b) => b.advantageScore - a.advantageScore);

        // Build secondary insights
        const secondaryInsights: string[] = [];
        const topSector = sectors[0];
        const botSector = sectors[sectors.length - 1];
        if (topSector) secondaryInsights.push(`🏆 Strongest sector: ${topSector.sector} (+${topSector.changePct.toFixed(2)}%)`);
        if (botSector && botSector.changePct < 0) secondaryInsights.push(`⚠️ Weakest sector: ${botSector.sector} (${botSector.changePct.toFixed(2)}%)`);
        if (vix > 20) secondaryInsights.push(`⚡ India VIX at ${vix.toFixed(1)} — market fear elevated`);
        if (vix < 12) secondaryInsights.push(`😴 India VIX at ${vix.toFixed(1)} — complacency risk, watch for spikes`);

        const nifty = indices.find(i => i.symbol === '^NSEI');
        if (nifty) secondaryInsights.push(`📊 Nifty 50: ₹${nifty.price.toLocaleString('en-IN')} (${nifty.changePct >= 0 ? '+' : ''}${nifty.changePct.toFixed(2)}%)`);

        return {
            marketCondition,
            conditionLabel: PRIMARY_INSIGHTS[marketCondition].split('—')[0].trim(),
            primaryInsight: PRIMARY_INSIGHTS[marketCondition],
            secondaryInsights,
            strategyRankings,
            riskLevel: RISK_LEVELS[marketCondition].level,
            riskColor: RISK_LEVELS[marketCondition].color,
            recommendedHoldingPeriod: HOLDING_PERIODS[marketCondition],
        };
    }

    /** Get advantage score for a specific strategy in current conditions */
    static getStrategyScore(strategy: StrategyType, condition: MarketCondition): number {
        return STRATEGY_SCORES[condition]?.[strategy] ?? 50;
    }
}
