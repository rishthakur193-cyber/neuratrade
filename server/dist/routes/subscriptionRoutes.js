import { Router } from 'express';
import { createSubscription, getSubscriptions, checkSubscription } from '../controllers/SubscriptionController.js';
import { authenticate } from '../middleware/authMiddleware.js';
const router = Router();
router.use(authenticate);
router.post('/', createSubscription);
router.get('/', getSubscriptions);
router.get('/check/:advisorId', checkSubscription);
export default router;
