import prisma from '../lib/prisma.js';
export class SubscriptionService {
    /**
     * Create a new advisor subscription.
     */
    static async createSubscription(input) {
        const startDate = new Date();
        // Default 30 days for Monthly
        const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return await prisma.advisorSubscription.upsert({
            where: {
                investorId_advisorId: {
                    investorId: input.investorId,
                    advisorId: input.advisorId
                }
            },
            update: {
                plan: input.plan,
                status: 'ACTIVE',
                startDate,
                endDate,
                updatedAt: new Date()
            },
            create: {
                investorId: input.investorId,
                advisorId: input.advisorId,
                plan: input.plan,
                status: 'ACTIVE',
                startDate,
                endDate
            }
        });
    }
    /**
     * Fetch active subscriptions for an investor.
     */
    static async getInvestorSubscriptions(userId) {
        // Find the investor profile first
        const investor = await prisma.investorProfile.findUnique({ where: { userId } });
        if (!investor)
            return [];
        return await prisma.advisorSubscription.findMany({
            where: {
                investorId: investor.id,
                status: 'ACTIVE'
            },
            include: {
                advisor: {
                    include: {
                        user: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });
    }
    /**
     * Check if an investor is subscribed to an advisor.
     */
    static async isSubscribed(userId, advisorId) {
        const investor = await prisma.investorProfile.findUnique({ where: { userId } });
        if (!investor)
            return false;
        const sub = await prisma.advisorSubscription.findFirst({
            where: {
                investorId: investor.id,
                advisorId: advisorId,
                status: 'ACTIVE'
            }
        });
        return !!sub;
    }
}
