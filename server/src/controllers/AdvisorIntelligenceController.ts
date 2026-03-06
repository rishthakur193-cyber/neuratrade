import type { Request, Response } from 'express';
import { AdvisorDiscoveryService } from '../services/AdvisorDiscoveryService.js';
import { TrustScoreService } from '../services/TrustScoreService.js';
import { VerifiedPerformanceService } from '../services/VerifiedPerformanceService.js';
import { AdvisorStrategyService } from '../services/AdvisorStrategyService.js';
import type { AuthRequest } from '../middleware/authMiddleware.js';

export const discoverAdvisors = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const results = await AdvisorDiscoveryService.discoverAdvisors(userId);
        res.status(200).json(results);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getTrustScore = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id) return res.status(400).json({ message: 'Missing advisor ID' });
        const score = await TrustScoreService.getTrustScore(id);
        res.status(200).json(score);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const computeTrustScore = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id) return res.status(400).json({ message: 'Missing advisor ID' });
        const score = await TrustScoreService.computeAndSave(id);
        res.status(200).json(score);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
    try {
        const results = await VerifiedPerformanceService.getLeaderboard();
        res.status(200).json(results);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getStrategyDNA = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id) return res.status(400).json({ message: 'Missing advisor ID' });
        const dna = await AdvisorStrategyService.getDNA(id);
        res.status(200).json(dna);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getVerifiedProfile = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id) return res.status(400).json({ message: 'Missing advisor ID' });
        const profile = await VerifiedPerformanceService.getVerifiedProfile(id);
        res.status(200).json(profile);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
