import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { publishSignal, getActiveSignals, closeSignal } from '../controllers/SignalController.js';

const router = express.Router();

router.get('/active', getActiveSignals as any);
router.post('/publish', authenticate as any, publishSignal as any);
router.post('/close/:id', authenticate as any, closeSignal as any);

export default router;
