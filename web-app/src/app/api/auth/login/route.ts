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
        console.error('[API_AUTH_LOGIN_ERROR]', {
            message: error.message,
            stack: error.stack,
            cause: error.cause
        });

        // Pass through specific error status codes if available in the error object
        // Or determine status based on common error messages
        let status = 500;
        let errorMessage = 'Internal server error';

        if (error.message.includes('Missing email or password')) {
            status = 400;
            errorMessage = error.message;
        } else if (error.message.includes('Invalid credentials') || error.message.includes('Invalid 2FA code')) {
            status = 401;
            errorMessage = error.message;
        } else if (error.message.includes('Rate limit exceeded')) {
            status = 429;
            errorMessage = error.message;
        } else {
            // General "Login failed" or other backend-provided messages
            errorMessage = error.message || 'Authentication failed';
        }

        return NextResponse.json({
            error: errorMessage,
            debug: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status });
    }
}
