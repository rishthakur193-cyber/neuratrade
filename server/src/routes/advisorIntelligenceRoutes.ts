import { Router } from 'express';
import {
    discoverAdvisors,
    getTrustScore,
    computeTrustScore,
    getLeaderboard,
    getStrategyDNA,
    getVerifiedProfile
} from '../controllers/AdvisorIntelligenceController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/discovery', authenticate, discoverAdvisors as any);
router.get('/trust-score/:id', getTrustScore as any);
router.post('/trust-score/:id/compute', authenticate, computeTrustScore as any);
router.get('/leaderboard', getLeaderboard as any);
router.get('/strategy-dna/:id', getStrategyDNA as any);
router.get('/performance/:id', authenticate, getVerifiedProfile as any);

export default router;
