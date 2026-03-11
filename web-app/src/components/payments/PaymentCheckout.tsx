'use client';

import React, { useState, useEffect } from 'react';
import { PaymentService } from '@/services/payment.service';
import { PremiumButton } from '@/components/ui/PremiumUI';
import { Zap, Loader2 } from 'lucide-react';

interface PaymentCheckoutProps {
    amount: number;
    advisorId: string;
    advisorName: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export const PaymentCheckout = ({ amount, advisorId, advisorName, onSuccess, onError }: PaymentCheckoutProps) => {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Pre-load Razorpay script
        PaymentService.loadRazorpay();
    }, []);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Initiate Order
            const orderData = await PaymentService.initiatePayment(amount, 'PLATFORM_SUB', advisorId);

            // 2. Open Razorpay Modal
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Ecosystem of Smart Investing",
                description: `Subscription for ${advisorName}`,
                order_id: orderData.orderId,
                handler: async (response: any) => {
                    try {
                        setLoading(true);
                        // 3. Verify Payment
                        await PaymentService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        if (onSuccess) onSuccess();
                        alert("Payment Successful! Your subscription is now active.");
                    } catch (err: any) {
                        if (onError) onError(err.message);
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: "User Name",
                    email: "user@example.com",
                },
                theme: {
                    color: "#7C4DFF",
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (err: any) {
            console.error(err);
            if (onError) onError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PremiumButton
            variant="primary"
            className="w-full py-4 text-sm font-black shadow-neon-glow flex items-center justify-center gap-2"
            onClick={handlePayment}
            disabled={loading}
        >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
            <span>{loading ? 'INITIALIZING...' : 'SUBSCRIBE TO STRATEGY'}</span>
        </PremiumButton>
    );
};
