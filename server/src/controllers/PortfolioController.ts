import type { Request, Response } from 'express';
import { PortfolioService } from '../services/PortfolioService.js';
import type { AuthRequest } from '../middleware/authMiddleware.js';

export const getOverview = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const data = await PortfolioService.getOverview(userId);
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const executeMockTrade = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { assetSymbol, type, quantity, price } = req.body;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        if (!assetSymbol || !type || !quantity || !price) {
            return res.status(400).json({ message: 'Missing trade details' });
        }

        const result = await PortfolioService.mockTrade(userId, assetSymbol, type, quantity, price);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
