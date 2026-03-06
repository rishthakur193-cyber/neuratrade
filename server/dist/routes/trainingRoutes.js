import { Router } from 'express';
import { getProgress, updateProgress } from '../controllers/TrainingController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.get('/progress', authenticate, getProgress);
router.post('/progress', authenticate, updateProgress);
export default router;
