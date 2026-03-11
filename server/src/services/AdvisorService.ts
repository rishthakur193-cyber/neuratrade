import prisma from '../lib/prisma.js';

export class AdvisorService {
    /**
     * Fetches the CRM list of all clients mapped to an Advisor
     */
    static async getClients(advisorUserId: string) {
        if (!advisorUserId) throw new Error("Missing Advisor User ID");

        const profile = await prisma.advisorProfile.findUnique({
            where: { userId: advisorUserId }
        });

        if (!profile) {
            throw new Error("Advisor Profile not found");
        }

        // Map clients
        const clients = await prisma.advisorClient.findMany({
            where: { advisorId: profile.id },
            include: {
                investor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        portfolios: {
                            select: { totalValue: true },
                            take: 1
                        }
                    }
                }
            }
        });

        return clients.map((ac: any) => ({
            mappingId: ac.id,
            status: ac.status,
            joinedAt: ac.createdAt,
            investorId: ac.investor.id,
            investorName: ac.investor.name,
            email: ac.investor.email,
            aum: ac.investor.portfolios[0]?.totalValue || 0
        }));
    }

    /**
     * Approves a lead/prospect to become an active client
     */
    static async acceptLead(advisorUserId: string, investorId: string) {
        const profile = await prisma.advisorProfile.findUnique({
            where: { userId: advisorUserId }
        });

        if (!profile) {
            throw new Error("Advisor Profile not found");
        }

        const client = await prisma.advisorClient.create({
            data: {
                advisorId: profile.id,
                investorId: investorId,
                status: 'ACTIVE'
            }
        });

        return { success: true, message: 'Investor successfully mapped to your CRM', mappingId: client.id };
    }

    static async getStrategies(advisorUserId: string) {
        const profile = await prisma.advisorProfile.findUnique({
            where: { userId: advisorUserId }
        });
        if (!profile) throw new Error("Advisor Profile not found");

        const strategies = await prisma.strategy.findMany({
            where: { advisorId: profile.id }
        });
        return { success: true, strategies };
    }

    static async getLeads(advisorUserId: string) {
        // Simple logic for leads: Investors not yet assigned to this advisor
        const profile = await prisma.advisorProfile.findUnique({ where: { userId: advisorUserId } });
        if (!profile) throw new Error("Advisor Profile not found");

        // Avoid investors already assigned
        const assignedInvestorIds = (await prisma.advisorClient.findMany({
            where: { advisorId: profile.id },
            select: { investorId: true }
        })).map(ac => ac.investorId);

        const potentialLeads = await prisma.investorProfile.findMany({
            where: {
                userId: { notIn: assignedInvestorIds }
            },
            include: { user: { select: { name: true } } },
            take: 5
        });

        return {
            success: true,
            leads: potentialLeads.map(l => ({
                id: l.id,
                name: l.user.name,
                profile: l.riskTolerance + ' / ' + (l.investorType || 'Retail'),
                match: 85 + Math.floor(Math.random() * 15) // Matching score can be algorithmic later
            }))
        };
    }
}
