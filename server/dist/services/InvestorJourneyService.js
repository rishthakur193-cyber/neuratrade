import prisma from '../lib/prisma.js';
import { randomUUID } from 'crypto';
const XP_ACTIONS = {
    profile_complete: 50,
    risk_profile_set: 50,
    first_advisor_follow: 75,
    first_sim_trade: 100,
    ten_sim_trades: 150,
    first_real_trade: 200,
    profitable_month: 300,
    recovery_complete: 200,
    community_post: 25,
    referral_success: 100,
};
const STAGE_THRESHOLDS = [
    ['BEGINNER', 0],
    ['LEARNER', 100],
    ['SIMULATOR', 500],
    ['ACTIVE', 2000],
    ['ADVANCED', 5000],
];
const STAGE_META = {
    BEGINNER: { color: '#78909c', benefits: ['Access to learning modules', 'View advisor profiles'], next: 'Complete your risk profile and follow your first advisor to become a Learner' },
    LEARNER: { color: '#7C4DFF', benefits: ['Paper trading unlocked', 'Community read access', 'Advisor recommendations'], next: 'Complete 10 simulation trades to advance to Simulator' },
    SIMULATOR: { color: '#00E5FF', benefits: ['Community posting rights', 'Strategy intelligence access', 'Personalized alerts'], next: 'Place your first verified real trade to become an Active Investor' },
    ACTIVE: { color: '#FFD740', benefits: ['Full portfolio analytics', 'Priority advisor matching', 'Weekly leaderboard visibility'], next: 'Sustain 3 profitable months to reach Advanced Investor status' },
    ADVANCED: { color: '#00E676', benefits: ['Full ecosystem access', 'Mentorship eligibility', 'Ecosystem metrics dashboard', 'Custom referral program'], next: '🏆 Maximum stage reached — you are a platform expert' },
};
export class InvestorJourneyService {
    static async getJourney(userId) {
        let journey = await prisma.investorJourney.findUnique({
            where: { userId }
        });
        if (!journey) {
            journey = await prisma.investorJourney.create({
                data: {
                    id: randomUUID(),
                    userId,
                    xp: 0,
                    achievements: '[]'
                }
            });
        }
        const xp = journey.xp;
        const stage = this.computeStage(xp);
        const { progress, xpToNext } = this.stageProgress(xp, stage);
        const meta = STAGE_META[stage];
        return {
            userId,
            stage,
            xp,
            xpToNextStage: xpToNext,
            stageProgress: progress,
            achievements: JSON.parse(journey.achievements || '[]'),
            nextMilestone: meta.next,
            stageBenefits: meta.benefits,
            stageColor: meta.color
        };
    }
    static async awardXp(userId, action) {
        const amount = XP_ACTIONS[action] ?? 10;
        await prisma.investorJourney.upsert({
            where: { userId },
            update: {
                xp: { increment: amount },
                lastActivityAt: new Date()
            },
            create: {
                id: randomUUID(),
                userId,
                xp: amount,
                achievements: '[]'
            }
        });
        return amount;
    }
    static computeStage(xp) {
        let stage = 'BEGINNER';
        for (const [s, threshold] of STAGE_THRESHOLDS) {
            if (xp >= threshold)
                stage = s;
        }
        return stage;
    }
    static stageProgress(xp, stage) {
        const idx = STAGE_THRESHOLDS.findIndex(([s]) => s === stage);
        const cur = STAGE_THRESHOLDS[idx][1];
        const next = STAGE_THRESHOLDS[idx + 1]?.[1] ?? xp;
        if (stage === 'ADVANCED')
            return { progress: 100, xpToNext: 0 };
        const progress = Math.round(((xp - cur) / (next - cur)) * 100);
        return { progress: Math.min(100, progress), xpToNext: Math.max(0, next - xp) };
    }
}
