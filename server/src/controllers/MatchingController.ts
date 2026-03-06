import type { Request, Response } from 'express';
import { MatchingService } from '../services/MatchingService.js';
import type { AuthRequest } from '../middleware/authMiddleware.js';

export const getMatches = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const matches = await MatchingService.getMatches(userId);
        res.status(200).json(matches);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
