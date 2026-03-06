import { InvestorJourneyService } from '../services/InvestorJourneyService.js';
import { RecoveryPathService } from '../services/RecoveryPathService.js';
import { CommunityService } from '../services/CommunityService.js';
import { StrategyIntelligenceService } from '../services/StrategyIntelligenceService.js';
import { ScamDetectionService } from '../services/ScamDetectionService.js';
export const getJourney = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const journey = await InvestorJourneyService.getJourney(userId);
        res.status(200).json(journey);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getRecoveryProgress = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const progress = await RecoveryPathService.getProgress(userId);
        res.status(200).json(progress);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const advanceRecoveryStage = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const result = await RecoveryPathService.advanceStage(userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getCommunityPosts = async (req, res) => {
    try {
        const limitStr = req.query.limit;
        const limit = typeof limitStr === 'string' ? parseInt(limitStr) : 20;
        const posts = await CommunityService.getPosts(limit);
        res.status(200).json(posts);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const createCommunityPost = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getStrategyIntelligence = async (req, res) => {
    try {
        const intel = await StrategyIntelligenceService.getIntelligence();
        res.status(200).json(intel);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getScamFlags = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id)
            return res.status(400).json({ message: 'Missing advisor ID' });
        const flags = await ScamDetectionService.getFlags(id);
        res.status(200).json(flags);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
