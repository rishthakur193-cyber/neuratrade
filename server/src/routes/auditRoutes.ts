import { Router } from 'express';
import { logAction, getLogs } from '../controllers/AuditController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/log', authenticate, logAction);
router.get('/logs', authenticate, getLogs);

export default router;
