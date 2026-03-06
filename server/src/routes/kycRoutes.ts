import { Router } from 'express';
import { updateKyc } from '../controllers/AuthController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/kyc/' });

// Forward to the same updateKyc controller, but handle multipart if needed
router.post('/upload', authenticate, upload.single('file'), updateKyc);

export default router;
