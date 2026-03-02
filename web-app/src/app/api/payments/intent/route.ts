import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment.service';
import { AuthService } from '@/services/auth.service';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized middleware barrier' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const user = await AuthService.me(token);

        if (!user) {
            return NextResponse.json({ error: 'Session Invalid' }, { status: 401 });
        }

        const body = await req.json();
        const { planName, amount } = body;

        if (!planName || !amount) {
            return NextResponse.json({ error: 'Missing plan details' }, { status: 400 });
        }

        const intent = await PaymentService.createSubscriptionIntent(user.id, planName, amount);

        return NextResponse.json(intent, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
