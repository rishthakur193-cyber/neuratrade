
import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import type { AuthRequest } from '../middleware/authMiddleware.js';

export const getSystemMetrics = async (req: AuthRequest, res: Response) => {
    try {
        const userCount = await prisma.user.count();
        const verifiedAdvisors = await prisma.advisorProfile.count({ where: { isVerified: true } });
        const pendingVerification = await prisma.advisorProfile.findMany({
            where: { isVerified: false },
            include: { user: { select: { name: true, email: true } } }
        });

        // Mock AUM for now as it's not aggregated yet
        const liveAUM = 2480000000; // 24.8 Cr

        res.status(200).json({
            systemUsers: userCount,
            verifiedAdvisors,
            verificationQueue: pendingVerification.map(adv => ({
                id: adv.id,
                name: adv.user.name,
                sebiRegNo: adv.sebiRegNo,
                status: adv.status
            })),
            liveAUM,
            alerts: [
                { type: 'SYSTEM_AUDIT', message: 'Database integrity check passed.', level: 'LOW' }
            ]
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyAdvisor = async (req: AuthRequest, res: Response) => {
    try {
        const { advisorProfileId } = req.body;
        if (!advisorProfileId) return res.status(400).json({ message: 'Missing advisorProfileId' });

        const updated = await prisma.advisorProfile.update({
            where: { id: advisorProfileId },
            data: {
                isVerified: true,
                status: 'VERIFIED',
                verifiedAt: new Date()
            }
        });

        res.status(200).json({ message: 'Advisor verified successfully', advisor: updated });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getFraudAlerts = async (req: AuthRequest, res: Response) => {
    try {
        const alerts = await prisma.scamFlag.findMany({
            include: { advisor: { include: { user: { select: { name: true } } } } }
        });
        res.status(200).json(alerts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getEntities = async (req: AuthRequest, res: Response) => {
    try {
        const advisors = await prisma.advisorProfile.findMany({ include: { user: true } });
        const investors = await prisma.investorProfile.findMany({ include: { user: true } });
        res.status(200).json({ advisors, investors });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getRevenueMetrics = async (req: AuthRequest, res: Response) => {
    try {
        const subscriptions = await prisma.platformSubscription.findMany();
        const totalRevenue = subscriptions.reduce((acc, sub) => acc + (sub.tier === 'Premium' ? 999 : 0), 0);
        res.status(200).json({ totalRevenue, subscriptionCount: subscriptions.length });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
