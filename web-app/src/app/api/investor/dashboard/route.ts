import { NextResponse } from 'next/server';
import { InvestorDashboardService } from '@/services/investor-dashboard.service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'current-user';

    try {
        const data = await InvestorDashboardService.getDashboardData(userId);
        return NextResponse.json({
            success: true,
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
