import prisma from '../lib/prisma.js';
import { randomUUID } from 'crypto';

export class AdvisorStrategyService {
    static async getDNA(advisorId: string) {
        const advisor = await prisma.advisorProfile.findUnique({
            where: { id: advisorId },
            include: {
                user: { select: { name: true } },
                strategyDNA: true,
                recommendations: true
            }
        });

        if (!advisor) return null;

        const dna = advisor.strategyDNA;
        const trades = advisor.recommendations;
        const closedTrades = trades.filter(t => t.result !== null);

        // Basic computation logic ported from web-app
        const winRate = closedTrades.length > 0
            ? (closedTrades.filter(t => t.result === 'WIN').length / closedTrades.length) * 100
            : (dna?.winRate ?? 0);

        return {
            advisorId: advisor.id,
            advisorName: advisor.user.name,
            sebiRegNo: advisor.sebiRegNo,
            strategyType: dna?.strategyType ?? 'Swing',
            winRate: Math.round(winRate * 10) / 10,
            consistencyScore: dna?.consistencyScore ?? 70,
            avgHoldingDays: dna?.avgHoldingDays ?? 5,
            historicalMaxDrawdown: dna?.historicalMaxDrawdown ?? 8,
            totalTrades: trades.length
        };
    }
}
