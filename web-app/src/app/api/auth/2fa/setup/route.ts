import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'super-secret-key-change-in-production-ecosystem-2026';

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('ecosystem_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);
        const result = await AuthService.setup2FA(decoded.userId);

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error('2FA Setup Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
