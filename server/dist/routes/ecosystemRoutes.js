import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getJourney, getRecoveryProgress, advanceRecoveryStage, getCommunityPosts, createCommunityPost, getStrategyIntelligence, getScamFlags } from '../controllers/EcosystemController.js';
const router = express.Router();
// Journey & Recovery
router.get('/journey', authenticate, getJourney);
router.get('/recovery', authenticate, getRecoveryProgress);
router.post('/recovery/advance', authenticate, advanceRecoveryStage);
// Community
router.get('/community', getCommunityPosts);
router.post('/community', authenticate, createCommunityPost);
// Intelligence Extensions
router.get('/strategy-intelligence', getStrategyIntelligence);
router.get('/scam-flags/:id', getScamFlags);
export default router;
