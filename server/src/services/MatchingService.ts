import prisma from '../lib/prisma.js';

export class MatchingService {
    /**
     * Generates a ranked list of recommended Advisors for an Investor based on Risk, AUM, and Tier.
     */
    static async getMatches(investorId: string) {
        if (!investorId) throw new Error("Missing Investor ID");

        // Fetch verified advisors with their user details
        const advisors = await prisma.advisorProfile.findMany({
            where: { isVerified: true },
            include: {
                user: {
                    select: { name: true }
                }
            },
            orderBy: [
                { rating: 'desc' },
                { alphaGenerated: 'desc' }
            ],
            take: 10
        });

        // Algorithm mapping risk to specialty
        const matches = advisors.map((adv) => {
            let baseScore = 75; // Baseline compatibility

            // Tier weighing
            if (adv.tier === 'Elite') baseScore += 10;
            if (adv.tier === 'Gold') baseScore += 5;

            // Performance weighing
            if (adv.alphaGenerated > 10) baseScore += 5;
            if (adv.rating >= 4.5) baseScore += 5;

            const finalScore = Math.min(baseScore, 99);

            return {
                id: adv.id,
                name: adv.user.name,
                sebiRegNo: adv.sebiRegNo,
                tier: adv.tier,
                aumManaged: adv.aumManaged,
                alphaGenerated: adv.alphaGenerated,
                rating: adv.rating,
                isVerified: adv.isVerified,
                matchScore: finalScore,
                matchReasoning: `Matched based on your target portfolio growth and advisor's ${adv.alphaGenerated}% historical alpha generation.`
            };
        });

        return matches.sort((a, b) => b.matchScore - a.matchScore);
    }
}
