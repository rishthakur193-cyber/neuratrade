// @ts-nocheck
/**
 * MODULE 3 + 4 — Advisor Compatibility Engine + Explainable Matching
 *
 * Weighted 4-factor scoring:
 *   Risk Compatibility    : 40%
 *   Strategy Compatibility: 30%
 *   Capital Compatibility : 15%
 *   Consistency Score     : 15%
 */

import { type InvestorProfile } from './risk-profiling.service';
import { type StrategyDNA, AdvisorStrategyService } from './advisor-strategy.service';
import { ScoringEngineService } from './scoring-engine.service';

export interface CompatibilityResult {
    advisorId: string;
    advisorName: string;
    sebiRegNo: string;
    compatibilityScore: number;          // 0-100 overall
    breakdown: {
        riskCompatibility: number;         // 0-40
        strategyCompatibility: number;     // 0-30
        capitalCompatibility: number;      // 0-15
        consistencyScore: number;          // 0-15
    };
    explanation: string[];               // Why this advisor was recommended
    warnings: string[];                  // Any mismatches to note
    dna: StrategyDNA;
}

// ─── Scoring Functions ──────────────────────────────────────────────────────

function capitalToNumber(range: string): { min: number; max: number } {
    const map: Record<string, { min: number; max: number }> = {
        '1L-3L': { min: 100000, max: 300000 },
        '3L-10L': { min: 300000, max: 1000000 },
        '10L-50L': { min: 1000000, max: 5000000 },
        '50L+': { min: 5000000, max: 50000000 },
    };
    return map[range] ?? { min: 100000, max: 500000 };
}

function scoreRiskCompatibility(investor: InvestorProfile, dna: StrategyDNA): number {
    const drawdownTolerance = parseFloat(investor.maxDrawdownTolerance.replace('%', ''));
    const advisorMaxDD = dna.historicalMaxDrawdown;

    // Full score if advisor's max DD is comfortably within tolerance
    if (advisorMaxDD <= drawdownTolerance * 0.8) return 40;
    if (advisorMaxDD <= drawdownTolerance) return 32;
    if (advisorMaxDD <= drawdownTolerance * 1.1) return 22;
    if (advisorMaxDD <= drawdownTolerance * 1.25) return 12;
    return 4; // Advisor way riskier than tolerance
}

function scoreStrategyCompatibility(investor: InvestorProfile, dna: StrategyDNA): number {
    const preferred = investor.preferredStrategy.toLowerCase();
    const advisorType = dna.strategyType.toLowerCase();

    const scoreMap: Record<string, number> = {
        'intraday': preferred.includes('intraday') || preferred.includes('scalp') ? 30 : preferred.includes('swing') ? 18 : 8,
        'swing': preferred.includes('swing') ? 30 : preferred.includes('positional') ? 22 : preferred.includes('intraday') ? 16 : 10,
        'positional': preferred.includes('positional') || preferred.includes('delivery') ? 30 : preferred.includes('swing') ? 22 : 8,
    };

    return scoreMap[advisorType] ?? 15;
}

function scoreCapitalCompatibility(investor: InvestorProfile, dna: StrategyDNA): number {
    const { min: invMin, max: invMax } = capitalToNumber(investor.capitalRange);
    const { min: advMin, max: advMax } = { min: dna.capitalMin, max: dna.capitalMax };

    // Full overlap
    if (invMin >= advMin && invMax <= advMax) return 15;
    // Partial overlap
    if (invMax >= advMin && invMin <= advMax) return 10;
    // Investor capital too small
    if (invMax < advMin) return 3;
    // Investor capital far exceeds advisor range (advisor may be under-skilled for that AUM)
    if (invMin > advMax * 2) return 5;
    return 12;
}

function scoreConsistency(dna: StrategyDNA): number {
    // Map 0-100 consistency score → 0-15
    return Math.round((dna.consistencyScore / 100) * 15);
}

// ─── Explanation Generator ──────────────────────────────────────────────────

function buildExplanation(
    investor: InvestorProfile,
    dna: StrategyDNA,
    breakdown: CompatibilityResult['breakdown']
): { explanation: string[]; warnings: string[] } {
    const explanation: string[] = [];
    const warnings: string[] = [];
    const drawdownTolerance = parseFloat(investor.maxDrawdownTolerance.replace('%', ''));

    if (dna.historicalMaxDrawdown <= drawdownTolerance) {
        explanation.push(`Max drawdown ${dna.historicalMaxDrawdown}% is within your tolerance of ${investor.maxDrawdownTolerance}`);
    } else {
        warnings.push(`Advisor's max drawdown (${dna.historicalMaxDrawdown}%) exceeds your tolerance (${investor.maxDrawdownTolerance})`);
    }

    if (breakdown.strategyCompatibility >= 25) {
        explanation.push(`Strategy type "${dna.strategyType}" aligns with your preference (${investor.preferredStrategy})`);
    } else if (breakdown.strategyCompatibility < 15) {
        warnings.push(`Strategy mismatch — advisor trades ${dna.strategyType.toLowerCase()}, you prefer ${investor.preferredStrategy.toLowerCase()}`);
    }

    if (breakdown.capitalCompatibility >= 12) {
        explanation.push(`Your capital range (${investor.capitalRange}) fits the advisor's recommended range (₹${(dna.capitalMin / 100000).toFixed(0)}L – ₹${(dna.capitalMax / 100000).toFixed(0)}L)`);
    }

    if (dna.winRate >= 65) {
        explanation.push(`Strong win rate of ${dna.winRate}% across ${dna.totalTrades} trades`);
    }

    if (dna.consistencyScore >= 80) {
        explanation.push(`Excellent consistency score of ${dna.consistencyScore}/100 — low strategy drift`);
    } else if (dna.consistencyScore < 60) {
        warnings.push(`Consistency score is ${dna.consistencyScore}/100 — strategy may show high variance`);
    }

    explanation.push(`Average holding period: ${dna.avgHoldingDays} days`);
    explanation.push(`Average return per trade: ${dna.avgReturnPerTrade}%`);

    return { explanation, warnings };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class CompatibilityService {
    /**
     * Run the compatibility engine against all available advisors.
     * Returns top N sorted by compatibility score.
     */
    static async getMatches(
        investor: InvestorProfile,
        topN = 3,
        useMock = false
    ): Promise<CompatibilityResult[]> {
        let dnaList: StrategyDNA[];

        if (useMock) {
            dnaList = AdvisorStrategyService.getMockDNASet();
        } else {
            dnaList = await AdvisorStrategyService.getAllDNA();
            if (dnaList.length === 0) {
                dnaList = AdvisorStrategyService.getMockDNASet();
            }
        }

        const results: CompatibilityResult[] = dnaList.map(dna => {
            const riskCompatibility = scoreRiskCompatibility(investor, dna);
            const strategyCompatibility = scoreStrategyCompatibility(investor, dna);
            const capitalCompatibility = scoreCapitalCompatibility(investor, dna);
            const consistencyScore = scoreConsistency(dna);

            const overall = ScoringEngineService.calculateCompatibilityScore({
                riskScore: riskCompatibility,
                strategyScore: strategyCompatibility,
                capitalScore: capitalCompatibility,
                consistencyScore: consistencyScore
            });
            const breakdown = { riskCompatibility, strategyCompatibility, capitalCompatibility, consistencyScore };
            const { explanation, warnings } = buildExplanation(investor, dna, breakdown);

            return {
                advisorId: dna.advisorId,
                advisorName: dna.advisorName,
                sebiRegNo: dna.sebiRegNo,
                compatibilityScore: overall,
                breakdown,
                explanation,
                warnings,
                dna,
            };
        });

        return results
            .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
            .slice(0, topN);
    }

    /** Compare arbitrary set of advisors against investor profile */
    static async compareAdvisors(
        investor: InvestorProfile,
        advisorIds: string[]
    ): Promise<CompatibilityResult[]> {
        const allMatches = await this.getMatches(investor, 100);
        const filtered = allMatches.filter(m => advisorIds.includes(m.advisorId));
        return filtered.length > 0 ? filtered : allMatches.slice(0, advisorIds.length);
    }
}

