import prisma from '../lib/prisma.js';
import { ScoringEngineService } from './ScoringEngineService.js';
const MARKET_FIT = {
    INTRADAY: 85, OPTIONS: 78, SWING: 65, POSITIONAL: 50, MOMENTUM: 55, SCALPING: 70,
};
export class AdvisorDiscoveryService {
    static async discoverAdvisors(userId) {
        // Fetch User's Investor Profile
        const investorProfile = await prisma.investorProfile.findUnique({
            where: { userId }
        });
        const userRiskScore = investorProfile?.riskScore ?? 50;
        const userCapital = investorProfile?.capitalRange === 'High' ? 90 : (investorProfile?.capitalRange === 'Medium' ? 70 : 50);
        const advisors = await prisma.advisorProfile.findMany({
            where: { isVerified: true },
            include: {
                user: { select: { name: true } },
                verificationBadge: true,
                trustScore: true,
                strategyDNA: true,
                performance: true
            },
            take: 20
        });
        const mapped = advisors.map(adv => {
            const strategy = adv.strategyDNA?.strategyType ?? 'SWING';
            const trust = adv.trustScore?.overallScore ?? 70;
            const mktFit = MARKET_FIT[strategy] ?? 60;
            // Calculate Performance Context
            const winRate = adv.performance?.winRate ?? 65;
            const maxDD = adv.performance?.maxDrawdown ?? 10;
            const avgReturn = adv.performance?.avgReturnPerTrade ?? 2.5;
            const compScore = ScoringEngineService.calculateCompatibilityScore({
                riskScore: userRiskScore,
                strategyScore: mktFit,
                capitalScore: userCapital,
                consistencyScore: trust
            });
            return {
                advisorId: adv.id,
                name: adv.user.name,
                sebiRegNo: adv.sebiRegNo,
                strategyType: strategy,
                compatibilityScore: compScore,
                trustScore: trust,
                marketFitScore: mktFit,
                verificationBadge: adv.verificationBadge?.badgeLevel ?? 'SILVER',
                winRate,
                maxDrawdown: maxDD,
                avgMonthlyReturn: avgReturn,
                compositeScore: compScore,
                matchReasons: this.buildReasons(trust, compScore),
                isTopPick: compScore >= 80
            };
        });
        return mapped.sort((a, b) => b.compositeScore - a.compositeScore);
    }
    static buildReasons(trust, comp) {
        const r = [];
        if (trust >= 85)
            r.push('Highly trusted by the platform');
        if (comp >= 75)
            r.push('Excellent match for your risk profile');
        return r.length > 0 ? r : ['Solid verified record'];
    }
}
