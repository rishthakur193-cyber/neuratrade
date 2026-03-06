import { NextRequest, NextResponse } from 'next/server';
import { MarketDataService } from '@/services/market-data.service';
import { RiskAlertService } from '@/services/risk-alert.service';

/** GET /api/market-intelligence/alerts?investorId=xxx */
export async function GET(req: NextRequest) {
    const investorId = req.nextUrl.searchParams.get('investorId') ?? 'mock-investor';
    try {
        const snapshot = await MarketDataService.fetchSnapshot();

        // Try DB first, then generate fresh
        let alerts = await RiskAlertService.getActiveAlerts(investorId);
        if (alerts.length === 0) {
            alerts = await RiskAlertService.generateAlertsForInvestor(investorId, snapshot.marketCondition);
        }

        return NextResponse.json({ alerts, marketCondition: snapshot.marketCondition });
    } catch {
        const mock = MarketDataService.getMockSnapshot();
        return NextResponse.json({
            alerts: RiskAlertService.getMockAlerts(mock.marketCondition),
            marketCondition: mock.marketCondition,
        });
    }
}
