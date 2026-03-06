import prisma from '../lib/prisma.js';
import { randomUUID } from 'crypto';
export class ScamDetectionService {
    static async scanAdvisor(advisorId) {
        const advisor = await prisma.advisorProfile.findUnique({
            where: { id: advisorId },
            include: { strategyDNA: true, recommendations: true }
        });
        if (!advisor)
            return [];
        const dna = advisor.strategyDNA;
        const trades = advisor.recommendations;
        const closed = trades.filter(t => t.result !== null);
        const returns = closed.map(t => t.returnPct || 0);
        const winRate = closed.length > 0 ? (closed.filter(t => t.result === 'WIN').length / closed.length) * 100 : 0;
        const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
        const flags = [];
        if (avgReturn > 40) {
            flags.push({
                advisorId,
                flagType: 'UNREALISTIC_RETURNS',
                severity: 'CRITICAL',
                description: `Claims average return of ${avgReturn}% per trade.`
            });
        }
        if (winRate > 92) {
            flags.push({
                advisorId,
                flagType: 'CHERRY_PICKING',
                severity: 'WARNING',
                description: `Win rate of ${winRate}% is statistically suspect.`
            });
        }
        if (!advisor.isVerified) {
            flags.push({
                advisorId,
                flagType: 'SEBI_UNVERIFIED',
                severity: 'CRITICAL',
                description: 'Advisor is NOT SEBI verified.'
            });
        }
        // Perspective: In a production app, we'd save these to the ScamFlag table
        for (const flag of flags) {
            await prisma.scamFlag.upsert({
                where: {
                    advisorId_flagType: {
                        advisorId: flag.advisorId,
                        flagType: flag.flagType
                    }
                },
                update: {
                    severity: flag.severity,
                    description: flag.description,
                    detectedAt: new Date()
                },
                create: {
                    advisorId: flag.advisorId,
                    flagType: flag.flagType,
                    severity: flag.severity,
                    description: flag.description
                }
            });
        }
        return flags;
    }
    static async getFlags(advisorId) {
        return await prisma.scamFlag.findMany({
            where: { advisorId },
            orderBy: { detectedAt: 'desc' }
        });
    }
}
