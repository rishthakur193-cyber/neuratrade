import prisma from '../lib/prisma.js';
import { ScoringEngineService } from './ScoringEngineService.js';
import { randomUUID } from 'crypto';

export class TrustScoreService {
    static async computeAndSave(advisorId: string) {
        const advisor = await prisma.advisorProfile.findUnique({
            where: { id: advisorId },
            include: { user: { select: { name: true } } }
        });

        if (!advisor) throw new Error('Advisor not found');

        const dna = await prisma.advisorStrategyDNA.findUnique({ where: { advisorId } });
        const trades = await prisma.advisorRecommendation.findMany({ where: { advisorId } });

        const closed = trades.filter((t: { result: string | null }) => t.result !== null);
        const wins = closed.filter((t: { result: string | null }) => t.result === 'WIN');

        const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 65;
        const dnaConsistency = dna?.consistencyScore ?? 70;
        const consistency = Math.round(((winRate / 100) * 5 + (dnaConsistency / 100) * 5) * 10) / 10;

        const hasStopLoss = trades.filter((t: { stopLoss: number, entryPrice: number }) => t.stopLoss && t.stopLoss > 0 && t.stopLoss < t.entryPrice);
        const slRatio = trades.length > 0 ? hasStopLoss.length / trades.length : 0.9;
        const riskManagement = Math.round(
            (slRatio * 6 + ((10 - Math.min(10, dna?.historicalMaxDrawdown ?? 10)) / 10) * 4) * 10
        ) / 10;

        const clientFeedback = Math.round(((advisor.rating ?? 3.5) / 5) * 10 * 10) / 10;

        const transparency = Math.round(((advisor.isVerified ? 5 : 0) + (dna ? 3 : 0) + 2) * 10) / 10;

        const overall = ScoringEngineService.calculateTrustScore({
            consistency,
            riskManagement,
            clientFeedback,
            transparency
        });

        await prisma.advisorTrustScore.upsert({
            where: { advisorId },
            update: {
                consistencyScore: consistency,
                riskManagementScore: riskManagement,
                clientFeedbackScore: clientFeedback,
                transparencyScore: transparency,
                overallScore: overall,
                updatedAt: new Date()
            },
            create: {
                id: randomUUID(),
                advisorId,
                consistencyScore: consistency,
                riskManagementScore: riskManagement,
                clientFeedbackScore: clientFeedback,
                transparencyScore: transparency,
                overallScore: overall
            }
        });

        return {
            advisorId,
            advisorName: advisor.user.name,
            overallScore: overall,
            consistency,
            riskManagement,
            clientFeedback,
            transparency
        };
    }

    static async getTrustScore(advisorId: string) {
        return await prisma.advisorTrustScore.findUnique({
            where: { advisorId }
        });
    }
}
