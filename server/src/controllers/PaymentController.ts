import type { Response } from 'express';
import { PaymentService } from '../services/PaymentService.js';
import type { AuthRequest } from '../middleware/authMiddleware.js';

export const initiatePayment = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { amount, planId, advisorId } = req.body;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        if (!amount) return res.status(400).json({ message: 'Amount is required' });

        const order = await PaymentService.createOrder(userId, amount, planId, advisorId);
        res.status(200).json(order);
    } catch (error: any) {
        console.error('Payment Initiation Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment details' });
        }

        const verification = await PaymentService.verifyPayment(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        res.status(200).json(verification);
    } catch (error: any) {
        console.error('Payment Verification Error:', error);
        res.status(400).json({ message: error.message });
    }
};
