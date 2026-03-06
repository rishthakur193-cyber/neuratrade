import { Router } from 'express';
import { register, login, me, setup2FA, verify2FA, updateKyc } from '../controllers/AuthController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', me);

// 2FA Routes (Protected)
router.get('/setup-2fa', authenticate, setup2FA);
router.post('/verify-2fa', authenticate, verify2FA);
router.post('/update-kyc', authenticate, updateKyc);

export default router;
