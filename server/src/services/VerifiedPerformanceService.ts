import prisma from '../lib/prisma.js';
import { randomUUID } from 'crypto';

export class VerifiedPerformanceService {
    static async getVerifiedProfile(advisorId: string) {
        const advisor = await prisma.advisorProfile.findUnique({
            where: { id: advisorId },
            include: {
                user: { select: { name: true } },
                verificationBadge: true,
                verifiedTrades: {
                    orderBy: { tradedAt: 'desc' },
                    take: 100
                },
                performance: true
            }
        });

        if (!advisor) return null;

        return {
            advisorId: advisor.id,
            advisorName: advisor.user.name,
            sebiRegNo: advisor.sebiRegNo,
            badgeLevel: advisor.verificationBadge?.badgeLevel ?? 'UNVERIFIED',
            verifiedTradeCount: advisor.verificationBadge?.verifiedTradeCount ?? 0,
            totalTradeCount: advisor.verificationBadge?.totalTradeCount ?? 0,
            verificationPct: advisor.verificationBadge?.verificationPct ?? 0,
            performance: advisor.performance,
            trades: advisor.verifiedTrades
        };
    }

    static async getLeaderboard() {
        const badges = await prisma.advisorVerificationBadge.findMany({
            include: {
                advisor: {
                    include: { user: { select: { name: true } } }
                }
            },
            orderBy: [
                { verificationPct: 'desc' },
                { verifiedTradeCount: 'desc' }
            ]
        });

        return badges.map(b => ({
            advisorId: b.advisorId,
            advisorName: b.advisor.user.name,
            sebiRegNo: b.advisor.sebiRegNo,
            badgeLevel: b.badgeLevel,
            verifiedTradeCount: b.verifiedTradeCount,
            totalTradeCount: b.totalTradeCount,
            verificationPct: b.verificationPct
        }));
    }
}
