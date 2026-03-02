import { NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';

export async function GET(req: Request) {
    try {
        // Check Authorization header first, then fallback to cookie
        let token = '';
        const authHeader = req.headers.get('authorization');

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            const cookieHeader = req.headers.get('cookie');
            if (cookieHeader) {
                const cookies = cookieHeader.split(';').map(c => c.trim().split('='));
                const tokenCookie = cookies.find(c => c[0] === 'ecosystem_token');
                if (tokenCookie) {
                    token = tokenCookie[1];
                }
            }
        }

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        try {
            const user = await AuthService.me(token);
            return NextResponse.json(user, { status: 200 });
        } catch (err: any) {
            if (err.message === 'Invalid token' || err.message === 'User not found') {
                return NextResponse.json({ error: err.message }, { status: 401 });
            }
            throw err;
        }

    } catch (error: any) {
        console.error('Fetch User Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
