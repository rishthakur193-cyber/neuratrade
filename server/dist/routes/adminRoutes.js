import { Router } from 'express';
import { getSystemMetrics, verifyAdvisor } from '../controllers/AdminController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
const router = Router();
// Only ADMIN role can access these routes
router.get('/metrics', authenticate, authorize(['ADMIN']), getSystemMetrics);
router.post('/verify', authenticate, authorize(['ADMIN']), verifyAdvisor);
export default router;
