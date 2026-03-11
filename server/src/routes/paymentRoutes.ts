import { Router } from 'express';
import { initiatePayment, verifyPayment } from '../controllers/PaymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/initiate', authenticate, initiatePayment);
router.post('/verify', authenticate, verifyPayment);

export default router;
