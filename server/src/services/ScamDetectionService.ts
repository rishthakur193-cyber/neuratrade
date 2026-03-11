import prisma from '../lib/prisma.js';
import { randomUUID } from 'crypto';

export type FlagSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type FlagType =
    | 'UNREALISTIC_RETURNS'
    | 'MISSING_STOP_LOSS'
    | 'EXTREME_LEVERAGE'
    | 'STRATEGY_INCONSISTENCY'
    | 'CHERRY_PICKING'
    | 'SEBI_UNVERIFIED'
    | 'MANIPULATED_PERFORMANCE'
    | 'DUPLICATE_STRATEGY';

export class ScamDetectionService {
    static async scanAdvisor(advisorId: string) {
        const advisor = await prisma.advisorProfile.findUnique({
            where: { id: advisorId },
            include: { strategyDNA: true, recommendations: true }
        });

        if (!advisor) return [];

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

        // 1. Detect Manipulated Performance (Abnormal Spikes)
        const spikes = returns.filter(r => r > 15); // >15% in a single signal is highly unusual for stable strategies
        if (spikes.length > 3) {
            flags.push({
                advisorId,
                flagType: 'MANIPULATED_PERFORMANCE',
                severity: 'CRITICAL',
                description: `Detected ${spikes.length} abnormal performance spikes (>15% per trade).`
            });
        }

        // 2. Detect Duplicate Strategies (Simplistic check for same CAGR/WinRate as others)
        const others = await prisma.advisorProfile.findMany({
            where: { id: { not: advisorId } },
            include: { performance: true }
        });

        for (const other of others) {
            if (other.performance && advisor.performance) {
                const sameWinRate = Math.abs(other.performance.winRate - advisor.performance.winRate) < 0.1;
                const sameDrawdown = Math.abs((other.performance.maxDrawdown || 0) - (advisor.performance.maxDrawdown || 0)) < 0.1;

                if (sameWinRate && sameDrawdown) {
                    flags.push({
                        advisorId,
                        flagType: 'DUPLICATE_STRATEGY',
                        severity: 'WARNING',
                        description: `Performance metrics nearly identical to Advisor ID: ${other.id.slice(0, 8)}.`
                    });
                    break;
                }
            }
        }

        // Perspective: In a production app, we'd save these to the ScamFlag table
        for (const flag of flags) {
            await prisma.scamFlag.upsert({
                where: {
                    advisorId_flagType: {
                        advisorId: flag.advisorId,
                        flagType: flag.flagType as any
                    }
                },
                update: {
                    severity: flag.severity as any,
                    description: flag.description,
                    detectedAt: new Date()
                },
                create: {
                    advisorId: flag.advisorId,
                    flagType: flag.flagType as any,
                    severity: flag.severity as any,
                    description: flag.description
                }
            });
        }

        return flags;
    }

    static async getFlags(advisorId: string) {
        return await prisma.scamFlag.findMany({
            where: { advisorId },
            orderBy: { detectedAt: 'desc' }
        });
    }
}
