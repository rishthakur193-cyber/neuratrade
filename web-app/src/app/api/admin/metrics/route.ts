import { NextResponse } from 'next/server';
import { AdminService } from '@/services/admin.service';
import { AuthService } from '@/services/auth.service';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized middleware barrier' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const user = await AuthService.me(token);

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Strictly Admin Privileges Required' }, { status: 403 });
        }

        const metrics = await AdminService.getPlatformIntegrityMetrics();

        return NextResponse.json(metrics, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
