import { Router } from 'express';
import { getMatches } from '../controllers/MatchingController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, getMatches);

export default router;
