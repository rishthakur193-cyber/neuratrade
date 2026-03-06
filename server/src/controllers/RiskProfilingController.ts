import type { Response } from 'express';
import { RiskProfilingService } from '../services/RiskProfilingService.js';
import type { AuthRequest } from '../middleware/authMiddleware.js';

export const saveProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const profile = await RiskProfilingService.saveProfile({
            ...req.body,
            userId
        });
        res.status(200).json(profile);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const profile = await RiskProfilingService.getProfile(userId);
        res.status(200).json(profile);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
