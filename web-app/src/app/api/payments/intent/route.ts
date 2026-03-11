import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { AuthService } from '@/services/auth.service';

export async function POST(req: Request) {
    try {
        const userId = req.headers.get('x-user-id');
        const userRole = req.headers.get('x-user-role');

        if (!userId) {
            return NextResponse.json({ error: 'Session Invalid or Missing' }, { status: 401 });
        }

        const body = await req.json();
        const { planName, amount } = body;

        if (!planName || !amount) {
            return NextResponse.json({ error: 'Missing plan details' }, { status: 400 });
        }

        const intent = await PaymentService.createSubscriptionIntent(userId, planName, amount);

        return NextResponse.json(intent, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
