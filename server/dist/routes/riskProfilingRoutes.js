import { Router } from 'express';
import { saveProfile, getProfile } from '../controllers/RiskProfilingController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticate);
router.post('/', saveProfile);
router.get('/', getProfile);
export default router;
