import type { Request, Response } from 'express';
import { AdvisorService } from '../services/AdvisorService.js';
import type { AuthRequest } from '../middleware/authMiddleware.js';

export const getClients = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const clients = await AdvisorService.getClients(userId);
        res.status(200).json(clients);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const acceptLead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { investorId } = req.body;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        if (!investorId) return res.status(400).json({ message: 'Missing investorId' });

        const result = await AdvisorService.acceptLead(userId, investorId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
