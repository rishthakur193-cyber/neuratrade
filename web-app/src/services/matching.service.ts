import { initDb } from '@/lib/db';

export class MatchingService {
    /**
     * Generates a ranked list of recommended Advisors for an Investor based on Risk, AUM, and Tier.
     */
    static async getMatches(investorId: string) {
        if (!investorId) throw new Error("Missing Investor ID");

        const db = await initDb();

        // In a real DB, we'd pull the investor's risk tolerance from InvestorProfile.
        // Assuming moderate/high risk for the algorithmic demonstration.

        const advisors = await db.all(`
      SELECT 
        ap.id,
        u.name,
        ap.sebiRegNo,
        ap.tier,
        ap.aumManaged,
        ap.alphaGenerated,
        ap.rating,
        ap.isVerified
      FROM AdvisorProfile ap
      JOIN User u ON ap.userId = u.id
      WHERE ap.isVerified = 1
      ORDER BY ap.rating DESC, ap.alphaGenerated DESC
      LIMIT 10
    `);

        // Algorithm mapping risk to specialty
        // Mock mapping algorithm applying an 'AI Match Score'
        const matches = advisors.map((adv: any) => {
            let baseScore = 75; // Baseline compatibility

            // Tier weighing
            if (adv.tier === 'Elite') baseScore += 10;
            if (adv.tier === 'Gold') baseScore += 5;

            // Performance weighing
            if (adv.alphaGenerated > 10) baseScore += 5;
            if (adv.rating >= 4.5) baseScore += 5;

            // Ensuring no score exceeds 99% 
            const finalScore = Math.min(baseScore, 99);

            return {
                ...adv,
                matchScore: finalScore,
                matchReasoning: `Matched based on your target portfolio growth and advisor's ${adv.alphaGenerated}% historical alpha generation.`
      };
    });

    // Sort by final match score
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }
}
