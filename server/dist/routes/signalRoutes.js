import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { publishSignal, getActiveSignals, closeSignal } from '../controllers/SignalController.js';
const router = express.Router();
router.get('/active', getActiveSignals);
router.post('/publish', authenticate, publishSignal);
router.post('/close/:id', authenticate, closeSignal);
export default router;
