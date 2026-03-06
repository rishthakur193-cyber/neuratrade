import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    try {
        if (!process.env.NEXTAUTH_SECRET) {
            return NextResponse.json({ error: '[FATAL] Server misconfiguration: NEXTAUTH_SECRET not set.' }, { status: 500 });
        }
        const JWT_SECRET = process.env.NEXTAUTH_SECRET;

        const { code } = await req.json();
        const cookieStore = await cookies();
        const token = cookieStore.get('ecosystem_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);
        const result = await AuthService.verifyAndEnable2FA(decoded.userId, code);

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error('2FA Verify Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
