import { NextResponse } from 'next/server';
import { adminGuard } from '@/lib/auth/admin-guard';
import { AdminAnalyticsService } from '@/services/admin-analytics.service';

export async function GET(request: Request) {
    const userId = request.headers.get('x-user-id') || 'guest';

    return adminGuard(userId, async () => {
        try {
            const stats = await AdminAnalyticsService.getPlatformStats();
            return NextResponse.json({ success: true, data: stats });
        } catch (error: any) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }
    });
}
