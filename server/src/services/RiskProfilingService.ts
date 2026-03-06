import prisma from '../lib/prisma.js';

export interface RiskQuestionnaireInput {
    userId: string;
    capitalRange: string;
    maxLossTolerance: number;
    investmentHorizon: string;
    tradingFrequency: string;
    experienceLevel: string;
    emotionalTolerance: string;
    preferredStyle?: 'MANUAL' | 'ALGO' | 'HYBRID';
}

export interface InvestorProfile {
    investorType: string;
    riskCategory: 'Conservative' | 'Moderate' | 'Aggressive';
    capitalRange: string;
    maxDrawdownTolerance: string;
    preferredStrategy: string;
    preferredStyle: string;
    riskScore: number;
}

function computeRiskScore(input: RiskQuestionnaireInput): number {
    let score = 0;
    const capitalMap: Record<string, number> = { '1L-3L': 5, '3L-10L': 10, '10L-50L': 15, '50L+': 20 };
    score += capitalMap[input.capitalRange] ?? 5;

    if (input.maxLossTolerance <= 5) score += 5;
    else if (input.maxLossTolerance <= 10) score += 15;
    else if (input.maxLossTolerance <= 20) score += 30;
    else score += 40;

    const horizonMap: Record<string, number> = { short: 5, medium: 15, long: 25 };
    score += horizonMap[input.investmentHorizon] ?? 10;

    const freqMap: Record<string, number> = { daily: 25, weekly: 15, monthly: 10, rarely: 5 };
    score += freqMap[input.tradingFrequency] ?? 10;

    const expMap: Record<string, number> = { beginner: 5, intermediate: 15, advanced: 25 };
    score += expMap[input.experienceLevel] ?? 10;

    if (input.preferredStyle === 'ALGO') score += 5;

    return Math.min(100, score);
}

function deriveProfile(input: RiskQuestionnaireInput, riskScore: number): InvestorProfile {
    let riskCategory: InvestorProfile['riskCategory'];
    if (riskScore < 35) riskCategory = 'Conservative';
    else if (riskScore < 70) riskCategory = 'Moderate';
    else riskCategory = 'Aggressive';

    const freqLabel: Record<string, string> = {
        daily: 'Intraday',
        weekly: 'Swing',
        monthly: 'Positional',
        rarely: 'Long-Term',
    };
    const freqStr = freqLabel[input.tradingFrequency] ?? 'Positional';
    const investorType = `${riskCategory} ${freqStr} Investor (${input.preferredStyle || 'Manual'})`;

    const strategyMap: Record<string, string> = {
        daily: 'Intraday / Scalping',
        weekly: 'Swing / Positional',
        monthly: 'Positional / Delivery',
        rarely: 'Long-Term / Buy & Hold',
    };
    const preferredStrategy = strategyMap[input.tradingFrequency] ?? 'Swing / Positional';

    return {
        investorType,
        riskCategory,
        capitalRange: input.capitalRange,
        maxDrawdownTolerance: `${input.maxLossTolerance}%`,
        preferredStrategy,
        preferredStyle: input.preferredStyle || 'MANUAL',
        riskScore,
    };
}

export class RiskProfilingService {
    static async saveProfile(input: RiskQuestionnaireInput): Promise<InvestorProfile> {
        const riskScore = computeRiskScore(input);
        const profile = deriveProfile(input, riskScore);

        await (prisma.investorProfile as any).upsert({
            where: { userId: input.userId },
            update: {
                capitalRange: input.capitalRange,
                maxLossTolerance: input.maxLossTolerance,
                investmentHorizon: input.investmentHorizon,
                tradingFrequency: input.tradingFrequency,
                experienceLevel: input.experienceLevel,
                emotionalTolerance: input.emotionalTolerance,
                investorType: profile.investorType,
                riskCategory: profile.riskCategory,
                preferredStrategy: profile.preferredStrategy,
                preferredStyle: profile.preferredStyle as any, // Enum mapping if needed
            },
            create: {
                userId: input.userId,
                capitalRange: input.capitalRange,
                maxLossTolerance: input.maxLossTolerance,
                investmentHorizon: input.investmentHorizon,
                tradingFrequency: input.tradingFrequency,
                experienceLevel: input.experienceLevel,
                emotionalTolerance: input.emotionalTolerance,
                investorType: profile.investorType,
                riskCategory: profile.riskCategory,
                preferredStrategy: profile.preferredStrategy,
                preferredStyle: profile.preferredStyle as any,
                riskScore: riskScore
            }
        });

        return profile;
    }

    static async getProfile(userId: string) {
        const profile = await prisma.investorProfile.findUnique({
            where: { userId }
        }) as any;
        if (!profile) return null;

        return {
            investorType: profile.investorType || 'Unknown',
            riskCategory: (profile.riskCategory as any) || 'Moderate',
            capitalRange: profile.capitalRange || '',
            maxDrawdownTolerance: `${profile.maxLossTolerance || 0}%`,
            preferredStrategy: profile.preferredStrategy || '',
            preferredStyle: profile.preferredStyle || 'MANUAL',
            riskScore: profile.riskScore || 0,
        };
    }
}
