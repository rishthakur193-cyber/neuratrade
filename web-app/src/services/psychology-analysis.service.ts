/**
 * Psychology Analysis Service — Module 2
 *
 * Scores 4 dangerous trading behaviour patterns (0–25 each = 0–100 total):
 *   - Revenge Trading
 *   - Over-Leverage
 *   - Strategy Hopping
 *   - Tip Following
 *
 * Generates a Risk Behaviour Score and danger pattern warnings.
 */

import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export type RiskLabel = 'SAFE' | 'MODERATE' | 'HIGH_RISK' | 'DANGEROUS';

export interface PsychologyAnswers {
    tradedAfterLoss: boolean;       // revenge trading
    positionSizeOver20pct: boolean; // over-leverage
    changedStrategy3xIn6m: boolean; // strategy hopping
    followedWhatsAppTips: boolean;  // tip following
    // Optional granularity (1–5 scale per pattern)
    revengeSeverity?: number;
    leverageSeverity?: number;
    hoppingSeverity?: number;
    tipSeverity?: number;
}

export interface PsychologyResult {
    id: string;
    userId: string;
    revengeTradingScore: number;
    overLeverageScore: number;
    strategyHoppingScore: number;
    tipFollowingScore: number;
    overallRiskBehaviourScore: number;
    riskLabel: RiskLabel;
    primaryDanger: string;
    dangerWarnings: string[];
    actionItems: string[];
    lastAssessedAt: string;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function patternScore(present: boolean, severity: number = 3): number {
    if (!present) return 0;
    return Math.round((severity / 5) * 25);
}

function getRiskLabel(total: number): RiskLabel {
    if (total >= 75) return 'DANGEROUS';
    if (total >= 50) return 'HIGH_RISK';
    if (total >= 25) return 'MODERATE';
    return 'SAFE';
}

const RISK_COLORS: Record<RiskLabel, string> = {
    SAFE: '#00E676',
    MODERATE: '#FFD740',
    HIGH_RISK: '#FF9800',
    DANGEROUS: '#FF5252',
};

const WARNINGS: Record<string, { warning: string; action: string }> = {
    revenge: {
        warning: 'You tend to trade immediately after a loss — this is revenge trading. It leads to emotional decisions and amplifies losses.',
        action: 'Implement a mandatory 48-hour cool-off rule after any trade that results in a loss > 2% of capital.',
    },
    leverage: {
        warning: 'Your position sizes are too large relative to your capital. Over-leverage is the #1 cause of account blow-ups.',
        action: 'Never risk more than 2% of your total capital on a single trade. Use smaller position sizes.',
    },
    hopping: {
        warning: 'Frequently switching strategies prevents any single strategy from working for you. You never give a system time to prove itself.',
        action: 'Commit to one well-defined strategy for a minimum of 6 months. Track performance objectively.',
    },
    tips: {
        warning: 'Trading based on WhatsApp groups or social media tips exposes you to pump-and-dump schemes and unverified information.',
        action: 'Follow only SEBI-registered advisors with verified performance records. Avoid anonymous tip channels.',
    },
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

function getMockAssessment(userId: string): PsychologyResult {
    return {
        id: `mock-pa-${userId}`, userId,
        revengeTradingScore: 20, overLeverageScore: 20, strategyHoppingScore: 15, tipFollowingScore: 25,
        overallRiskBehaviourScore: 80, riskLabel: 'DANGEROUS',
        primaryDanger: 'Tip Following — trading on unverified social media advice',
        dangerWarnings: [WARNINGS.tips.warning, WARNINGS.revenge.warning, WARNINGS.leverage.warning],
        actionItems: [WARNINGS.tips.action, WARNINGS.revenge.action, WARNINGS.leverage.action],
        lastAssessedAt: new Date().toISOString(),
    };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class PsychologyAnalysisService {

    static analyze(userId: string, answers: PsychologyAnswers): PsychologyResult {
        const revenge = patternScore(answers.tradedAfterLoss, answers.revengeSeverity ?? 4);
        const leverage = patternScore(answers.positionSizeOver20pct, answers.leverageSeverity ?? 4);
        const hopping = patternScore(answers.changedStrategy3xIn6m, answers.hoppingSeverity ?? 3);
        const tips = patternScore(answers.followedWhatsAppTips, answers.tipSeverity ?? 5);
        const total = revenge + leverage + hopping + tips;
        const label = getRiskLabel(total);

        // Build danger list sorted by score desc
        const patterns = [
            { key: 'revenge', score: revenge, name: 'Revenge Trading' },
            { key: 'leverage', score: leverage, name: 'Over-Leverage' },
            { key: 'hopping', score: hopping, name: 'Strategy Hopping' },
            { key: 'tips', score: tips, name: 'Tip Following' },
        ].sort((a, b) => b.score - a.score);

        const active = patterns.filter(p => p.score > 0);
        const warnings = active.map(p => WARNINGS[p.key].warning);
        const actions = active.map(p => WARNINGS[p.key].action);
        const primaryDanger = active[0]
            ? `${active[0].name} — ${WARNINGS[active[0].key].warning.split('.')[0]}`
            : 'No significant risk patterns detected';

        return {
            id: randomUUID(), userId,
            revengeTradingScore: revenge, overLeverageScore: leverage,
            strategyHoppingScore: hopping, tipFollowingScore: tips,
            overallRiskBehaviourScore: total, riskLabel: label,
            primaryDanger, dangerWarnings: warnings, actionItems: actions,
            lastAssessedAt: new Date().toISOString(),
        };
    }

    static async saveAssessment(result: PsychologyResult): Promise<void> {
        try {
            const db = await initDb();
            await db.run(
                `INSERT INTO PsychologyAssessment
           (id, userId, revengeTradingScore, overLeverageScore, strategyHoppingScore,
            tipFollowingScore, overallRiskBehaviourScore, riskLabel, primaryDanger)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [result.id, result.userId, result.revengeTradingScore, result.overLeverageScore,
                result.strategyHoppingScore, result.tipFollowingScore, result.overallRiskBehaviourScore,
                result.riskLabel, result.primaryDanger]
            );
        } catch { /* non-fatal */ }
    }

    static async getLatest(userId: string): Promise<PsychologyResult | null> {
        try {
            const db = await initDb();
            const row: any = await db.get(
                'SELECT * FROM PsychologyAssessment WHERE userId = ? ORDER BY lastAssessedAt DESC LIMIT 1',
                [userId]
            );
            if (!row) return null;
            return { ...row, dangerWarnings: [], actionItems: [] };
        } catch { return null; }
    }

    static getRiskColor(label: RiskLabel): string { return RISK_COLORS[label]; }
    static getMockAssessment = getMockAssessment;
}
