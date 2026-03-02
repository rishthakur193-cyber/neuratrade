import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';

export async function POST(req: Request) {
    try {
        const { email, password, totpCode } = await req.json();
        const context = {
            ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
            userAgent: req.headers.get('user-agent') || 'unknown'
        };

        const result = await AuthService.login({ email, password, totpCode }, context);

        if (result.requires2FA) {
            return NextResponse.json(result, { status: 200 });
        }

        const response = NextResponse.json(result, { status: 200 });

        // Set HTTP-Only Cookie for Middleware RBAC
        if (result.token) {
            response.cookies.set({
                name: 'ecosystem_token',
                value: result.token,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 // 24 hours
            });
        }

        return response;
    } catch (error: any) {
        if (error.message === 'Missing email or password') {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        if (error.message === 'Invalid credentials') {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
