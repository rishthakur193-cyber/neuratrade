import Razorpay from 'razorpay';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export class PaymentService {
    /**
     * Create a new Razorpay Order
     */
    static async createOrder(userId: string, amount: number, planId?: string, advisorId?: string) {
        try {
            const options = {
                amount: amount * 100, // Amount in paise
                currency: "INR",
                receipt: `rcpt_${Date.now()}_${userId.slice(0, 5)}`,
            };

            const order = await razorpay.orders.create(options);

            // Save the payment record in our DB
            const payment = await prisma.payment.create({
                data: {
                    orderId: order.id,
                    amount: amount,
                    userId: userId,
                    planId: planId,
                    advisorId: advisorId,
                    status: 'CREATED'
                }
            });

            return {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID
            };
        } catch (error) {
            console.error('Razorpay Order Creation Error:', error);
            throw new Error('Could not create payment order');
        }
    }

    /**
     * Verify Razorpay Payment Signature
     */
    static async verifyPayment(orderId: string, paymentId: string, signature: string) {
        try {
            const body = orderId + "|" + paymentId;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
                .update(body.toString())
                .digest('hex');

            const isAuthentic = expectedSignature === signature;

            if (isAuthentic) {
                // Update payment record
                await prisma.payment.update({
                    where: { orderId: orderId },
                    data: {
                        paymentId: paymentId,
                        signature: signature,
                        status: 'CAPTURED'
                    }
                });

                // Here we could trigger subscription activation
                return { status: 'success' };
            } else {
                await prisma.payment.update({
                    where: { orderId: orderId },
                    data: { status: 'FAILED' }
                });
                throw new Error('Invalid payment signature');
            }
        } catch (error: any) {
            console.error('Razorpay Verification Error:', error);
            throw new Error(error.message || 'Payment verification failed');
        }
    }
}
