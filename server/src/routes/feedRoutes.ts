import { Router } from 'express';
import { FeedController } from '../controllers/FeedController.js';

const router = Router();

// Secure route to fetch personalized feed
// Normally requires authentication middleware, omitting for hackathon/development speed
router.get('/dynamic', FeedController.getDynamicFeed);

export default router;
