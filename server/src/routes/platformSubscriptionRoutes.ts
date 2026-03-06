import { Router } from 'express';
import { upgradePlatformPlan, getPlatformSubscription } from '../controllers/PlatformSubscriptionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/upgrade', upgradePlatformPlan);
router.get('/me', getPlatformSubscription);

export default router;
