import { Router } from 'express';
import {
    getSystemMetrics,
    verifyAdvisor,
    getFraudAlerts,
    getEntities,
    getRevenueMetrics
} from '../controllers/AdminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

// Only ADMIN role can access these routes
router.get('/metrics', authenticate, authorize(['ADMIN']), getSystemMetrics);
router.post('/verify', authenticate, authorize(['ADMIN']), verifyAdvisor);
router.get('/fraud', authenticate, authorize(['ADMIN']), getFraudAlerts);
router.get('/entities', authenticate, authorize(['ADMIN']), getEntities);
router.get('/revenue', authenticate, authorize(['ADMIN']), getRevenueMetrics);

export default router;
