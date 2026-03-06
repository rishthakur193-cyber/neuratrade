// @ts-nocheck
import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const context = {
            ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
            userAgent: req.headers.get('user-agent') || 'unknown'
        };

        const result = await AuthService.register(body, context);

        return NextResponse.json({ message: 'User created successfully', ...result }, { status: 201 });
    } catch (error: any) {
        if (error.message === 'Missing required fields') {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        if (error.message === 'User already exists') {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }

        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

