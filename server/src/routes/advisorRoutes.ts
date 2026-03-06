import { Router } from 'express';
import { getClients, acceptLead } from '../controllers/AdvisorController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/clients', authenticate, authorize(['ADVISOR']), getClients);
router.post('/accept-lead', authenticate, authorize(['ADVISOR']), acceptLead);

export default router;
