import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Require email and newPassword
        const result = await AuthService.resetPassword(body);

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        if (error.message === 'Missing required fields') {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        if (error.message === 'User not found') {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        console.error('Password Reset Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
