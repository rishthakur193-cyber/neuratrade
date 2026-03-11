import { Router } from 'express';
import { getClients, acceptLead, getStrategies, getLeads } from '../controllers/AdvisorController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/clients', authenticate, authorize(['ADVISOR']), getClients);
router.post('/accept-lead', authenticate, authorize(['ADVISOR']), acceptLead);
router.get('/strategies', authenticate, authorize(['ADVISOR']), getStrategies);
router.get('/leads', authenticate, authorize(['ADVISOR']), getLeads);

export default router;
