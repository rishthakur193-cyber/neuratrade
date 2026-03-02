import { NextResponse } from 'next/server';
import { SmartApiService } from '@/services/smartapi.service';
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
        const { clientCode, mpin, totp } = body;

        const session = await SmartApiService.loginWithMpin(clientCode, mpin, totp);

        return NextResponse.json(session, { status: 200 });

    } catch (error: any) {
        if (error.message.includes('Missing') || error.message.includes('Invalid')) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
