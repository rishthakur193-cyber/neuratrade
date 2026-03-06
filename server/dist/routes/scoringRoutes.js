import { Router } from 'express';
import { calculateTrustScore, calculateCompatibility } from '../controllers/ScoringController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.post('/trust', authenticate, calculateTrustScore);
router.post('/compatibility', authenticate, calculateCompatibility);
export default router;
