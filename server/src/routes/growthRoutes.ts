import { Router } from 'express';
import { GrowthController } from '../controllers/GrowthController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/rewards', authenticate, GrowthController.getMyRewards);
router.get('/leaderboard', GrowthController.getLeaderboard);
router.get('/activities', GrowthController.getActivities);
router.get('/referral-code', authenticate, GrowthController.getReferralCode);

export default router;
