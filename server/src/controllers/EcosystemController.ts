import type { Response } from 'express';
import { InvestorJourneyService } from '../services/InvestorJourneyService.js';
import { RecoveryPathService } from '../services/RecoveryPathService.js';
import { CommunityService } from '../services/CommunityService.js';
import { StrategyIntelligenceService } from '../services/StrategyIntelligenceService.js';
import { ScamDetectionService } from '../services/ScamDetectionService.js';
import type { AuthRequest } from '../middleware/authMiddleware.js';

export const getJourney = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const journey = await InvestorJourneyService.getJourney(userId);
        res.status(200).json(journey);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getRecoveryProgress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const progress = await RecoveryPathService.getProgress(userId);
        res.status(200).json(progress);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const advanceRecoveryStage = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const result = await RecoveryPathService.advanceStage(userId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCommunityPosts = async (req: AuthRequest, res: Response) => {
    try {
        const limitStr = req.query.limit;
        const limit = typeof limitStr === 'string' ? parseInt(limitStr) : 20;
        const posts = await CommunityService.getPosts(limit);
        res.status(200).json(posts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createCommunityPost = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { content, tags, parentId, authorType, authorName } = req.body;
        const post = await CommunityService.createPost({
            authorId: userId,
            authorType: authorType || 'INVESTOR',
            authorName: authorName || 'Anonymous',
            content,
            tags: tags || [],
            parentId
        });
        res.status(201).json(post);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getStrategyIntelligence = async (req: AuthRequest, res: Response) => {
    try {
        const intel = await StrategyIntelligenceService.getIntelligence();
        res.status(200).json(intel);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getScamFlags = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id) return res.status(400).json({ message: 'Missing advisor ID' });
        const flags = await ScamDetectionService.getFlags(id);
        res.status(200).json(flags);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
