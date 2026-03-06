// @ts-nocheck
import { NextResponse } from 'next/server';
import { AdvisorDiscoveryService } from '@/services/advisor-discovery.service';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'current-user'; // Mock session
    const strategyType = searchParams.get('strategyType') as any;
    const maxDrawdown = searchParams.get('maxDrawdown') ? parseFloat(searchParams.get('maxDrawdown')!) : undefined;

    try {
        const advisors = await AdvisorDiscoveryService.discoverAdvisors(userId, {
            strategyType,
            maxDrawdown
        });

        return NextResponse.json({
            success: true,
            data: advisors,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

