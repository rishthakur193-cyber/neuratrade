import { Router } from 'express';
import { getInsights } from '../controllers/AIController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/insights', authenticate, getInsights);

export default router;
