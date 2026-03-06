import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
    getJourney,
    getRecoveryProgress,
    advanceRecoveryStage,
    getCommunityPosts,
    createCommunityPost,
    getStrategyIntelligence,
    getScamFlags
} from '../controllers/EcosystemController.js';

const router = express.Router();

// Journey & Recovery
router.get('/journey', authenticate as any, getJourney as any);
router.get('/recovery', authenticate as any, getRecoveryProgress as any);
router.post('/recovery/advance', authenticate as any, advanceRecoveryStage as any);

// Community
router.get('/community', getCommunityPosts as any);
router.post('/community', authenticate as any, createCommunityPost as any);

// Intelligence Extensions
router.get('/strategy-intelligence', getStrategyIntelligence as any);
router.get('/scam-flags/:id', getScamFlags as any);

export default router;
