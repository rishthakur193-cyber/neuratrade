import type { Request, Response } from 'express';
import { GrowthService } from '../services/GrowthService.js';
import type { AuthRequest } from '../middleware/authMiddleware.js';

export class GrowthController {
    /**
     * GET /api/growth/rewards
     */
    static async getMyRewards(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const rewards = await (prisma as any).userRewards.findUnique({
                where: { userId }
            });

            res.status(200).json(rewards || { points: 0, level: 1, badges: '[]' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * GET /api/growth/leaderboard
     */
    static async getLeaderboard(req: Request, res: Response) {
        try {
            const leaderboard = await GrowthService.getGrowthLeaderboard();
            res.status(200).json(leaderboard);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * GET /api/growth/activities
     */
    static async getActivities(req: Request, res: Response) {
        try {
            const limit = parseInt(req.query.limit as string) || 20;
            const activities = await GrowthService.getRecentActivities(limit);
            res.status(200).json(activities);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * POST /api/growth/referral-code
     * Ensures user has a referral code (lazy initialization if needed)
     */
    static async getReferralCode(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const user = await (prisma as any).user.findUnique({
                where: { id: userId },
                select: { referralCode: true }
            });

            res.status(200).json({ referralCode: user.referralCode });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

// Need to import prisma inside controller or use a global one
import prisma from '../lib/prisma.js';
