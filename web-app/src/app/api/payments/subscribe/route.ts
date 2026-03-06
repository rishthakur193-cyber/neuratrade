// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req }) as any;
        if (!token?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { plan, amount, method } = body;

        // Call the central server to upgrade the plan and log the audit
        const response = await fetch(`${BASE_URL}/platform-subscriptions/upgrade`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ plan, amount, method })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to upgrade platform subscription');

        return NextResponse.json({ success: true, message: `Successfully upgraded to ${plan}`, data: result });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

