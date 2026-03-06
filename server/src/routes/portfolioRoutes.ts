import { Router } from 'express';
import { getOverview, executeMockTrade } from '../controllers/PortfolioController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/overview', authenticate, getOverview);
router.post('/mock-trade', authenticate, executeMockTrade);

export default router;
