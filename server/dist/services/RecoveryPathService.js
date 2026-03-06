import prisma from '../lib/prisma.js';
import { randomUUID } from 'crypto';
export const STAGE_CONFIG = [
    {
        stage: 'LEARN', label: 'Stage 1 — Learn',
        description: 'Study strategy basics, risk management fundamentals, and market psychology.',
        capitalLimit: 0, icon: '📚', color: '#7C4DFF',
        requirement: 'Complete all learning modules and score ≥ 70 on the assessment.',
    },
    {
        stage: 'SIMULATE', label: 'Stage 2 — Simulate',
        description: 'Follow verified advisors in paper trading mode. No real money at risk.',
        capitalLimit: 10000, icon: '🎯', color: '#FFD740',
        requirement: 'Complete 10 paper trades with a win rate ≥ 55% and discipline score ≥ 65.',
    },
    {
        stage: 'INVEST', label: 'Stage 3 — Controlled Investing',
        description: 'Invest real capital with strict risk controls and verified advisor guidance.',
        capitalLimit: null, icon: '🏦', color: '#00E676',
        requirement: 'Demonstrate 2+ profitable simulated months and confidence index ≥ 70.',
    },
];
export class RecoveryPathService {
    static async getProgress(userId) {
        let progress = await prisma.recoveryProgress.findUnique({
            where: { userId }
        });
        if (!progress) {
            progress = await prisma.recoveryProgress.create({
                data: {
                    id: randomUUID(),
                    userId,
                    currentStage: 'LEARN',
                    stageProgress: 0
                }
            });
        }
        const stage = progress.currentStage;
        const total = progress.totalSimTrades;
        const profit = progress.profitableSimTrades;
        const winRate = total > 0 ? Math.round((profit / total) * 100) : 0;
        return {
            userId,
            currentStage: stage,
            stageProgress: progress.stageProgress,
            learnScore: progress.learnScore,
            simulationPnl: progress.simulationPnl,
            disciplineScore: progress.disciplineScore,
            capitalUnlocked: progress.capitalUnlocked,
            totalSimTrades: total,
            profitableSimTrades: profit,
            winRate,
            capitalLimit: stage === 'LEARN' ? 0 : stage === 'SIMULATE' ? 10000 : null,
            nextStageRequirement: this.getNextRequirement(stage, winRate, total),
            isReadyToAdvance: this.checkReadiness(stage, progress.learnScore, winRate, total, progress.disciplineScore),
            stages: STAGE_CONFIG
        };
    }
    static async advanceStage(userId) {
        const p = await this.getProgress(userId);
        if (!p.isReadyToAdvance)
            throw new Error('Requirements not yet met');
        const next = { LEARN: 'SIMULATE', SIMULATE: 'INVEST', INVEST: 'INVEST' };
        const newStage = next[p.currentStage];
        await prisma.recoveryProgress.update({
            where: { userId },
            data: {
                currentStage: newStage,
                capitalUnlocked: newStage === 'SIMULATE' ? 10000 : 0,
                stageProgress: 0
            }
        });
        return { success: true, newStage };
    }
    static getNextRequirement(stage, winRate, total) {
        if (stage === 'LEARN')
            return 'Score ≥ 70 on assessment';
        if (stage === 'SIMULATE')
            return `Win rate ≥ 55% over 10+ trades (current: ${winRate}% over ${total})`;
        return 'Full capital access unlocked ✅';
    }
    static checkReadiness(stage, learnScore, winRate, total, discipline) {
        if (stage === 'LEARN')
            return learnScore >= 70;
        if (stage === 'SIMULATE')
            return total >= 10 && winRate >= 55 && discipline >= 65;
        return false;
    }
}
