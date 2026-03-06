import prisma from '../lib/prisma.js';
function computeRiskScore(input) {
    let score = 0;
    const capitalMap = { '1L-3L': 5, '3L-10L': 10, '10L-50L': 15, '50L+': 20 };
    score += capitalMap[input.capitalRange] ?? 5;
    if (input.maxLossTolerance <= 5)
        score += 5;
    else if (input.maxLossTolerance <= 10)
        score += 15;
    else if (input.maxLossTolerance <= 20)
        score += 30;
    else
        score += 40;
    const horizonMap = { short: 5, medium: 15, long: 25 };
    score += horizonMap[input.investmentHorizon] ?? 10;
    const freqMap = { daily: 25, weekly: 15, monthly: 10, rarely: 5 };
    score += freqMap[input.tradingFrequency] ?? 10;
    const expMap = { beginner: 5, intermediate: 15, advanced: 25 };
    score += expMap[input.experienceLevel] ?? 10;
    if (input.preferredStyle === 'ALGO')
        score += 5;
    return Math.min(100, score);
}
function deriveProfile(input, riskScore) {
    let riskCategory;
    if (riskScore < 35)
        riskCategory = 'Conservative';
    else if (riskScore < 70)
        riskCategory = 'Moderate';
    else
        riskCategory = 'Aggressive';
    const freqLabel = {
        daily: 'Intraday',
        weekly: 'Swing',
        monthly: 'Positional',
        rarely: 'Long-Term',
    };
    const freqStr = freqLabel[input.tradingFrequency] ?? 'Positional';
    const investorType = `${riskCategory} ${freqStr} Investor (${input.preferredStyle || 'Manual'})`;
    const strategyMap = {
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
    static async saveProfile(input) {
        const riskScore = computeRiskScore(input);
        const profile = deriveProfile(input, riskScore);
        await prisma.investorProfile.upsert({
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
                preferredStyle: profile.preferredStyle, // Enum mapping if needed
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
                preferredStyle: profile.preferredStyle,
                riskScore: riskScore
            }
        });
        return profile;
    }
    static async getProfile(userId) {
        const profile = await prisma.investorProfile.findUnique({
            where: { userId }
        });
        if (!profile)
            return null;
        return {
            investorType: profile.investorType || 'Unknown',
            riskCategory: profile.riskCategory || 'Moderate',
            capitalRange: profile.capitalRange || '',
            maxDrawdownTolerance: `${profile.maxLossTolerance || 0}%`,
            preferredStrategy: profile.preferredStrategy || '',
            preferredStyle: profile.preferredStyle || 'MANUAL',
            riskScore: profile.riskScore || 0,
        };
    }
}
