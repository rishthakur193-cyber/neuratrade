import type { Request, Response } from 'express';
import { ScoringEngineService } from '../services/ScoringEngineService.js';

export const calculateTrustScore = async (req: Request, res: Response) => {
    try {
        const { consistency, riskManagement, clientFeedback, transparency } = req.body;
        const score = ScoringEngineService.calculateTrustScore({
            consistency: consistency || 0,
            riskManagement: riskManagement || 0,
            clientFeedback: clientFeedback || 0,
            transparency: transparency || 0
        });
        res.status(200).json({ trustScore: score });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const calculateCompatibility = async (req: Request, res: Response) => {
    try {
        const { riskScore, strategyScore, capitalScore, consistencyScore } = req.body;
        const score = ScoringEngineService.calculateCompatibilityScore({
            riskScore: riskScore || 0,
            strategyScore: strategyScore || 0,
            capitalScore: capitalScore || 0,
            consistencyScore: consistencyScore || 0
        });
        res.status(200).json({ compatibilityScore: score });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
