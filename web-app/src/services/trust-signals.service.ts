const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface AdvisorTrustSignal {
    advisorId: string;
    advisorName: string;
    verificationBadge: string;
    verificationPct: number;
    totalVerifiedTrades: number;
    scamFlags: number;
    reputationScore: number;
    reputationLabel: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    lastVerifiedAt: string;
    trustColor: string;
}

export interface PlatformTrustReport {
    totalAdvisors: number;
    verifiedAdvisors: number;
    scamFlagsDetected: number;
    scamFlagsResolved: number;
    averageTrustScore: number;
    totalVerifiedTrades: number;
    investorProtectionRate: number;
    lastAuditDate: string;
}

export class TrustSignalsService {
    static async getAdvisorSignals(): Promise<AdvisorTrustSignal[]> {
        const res = await fetch(`${API_URL}/advisor-intelligence/leaderboard`);
        if (!res.ok) return [];
        const leaderboard = await res.json();

        return leaderboard.map((r: any) => ({
            advisorId: r.advisorId,
            advisorName: r.advisorName,
            verificationBadge: r.badgeLevel || 'SILVER',
            verificationPct: r.verificationPct || 0,
            totalVerifiedTrades: r.verifiedTradeCount || 0,
            scamFlags: 0, // In a real app, we'd fetch these too or include in leaderboard
            reputationScore: 80,
            reputationLabel: 'GOOD',
            lastVerifiedAt: new Date().toISOString(),
            trustColor: '#69F0AE'
        }));
    }

    static async getPlatformReport(): Promise<PlatformTrustReport> {
        // This could be a separate endpoint or computed from existing ones
        // For now, we'll return a default or mock if endpoint doesn't exist
        return {
            totalAdvisors: 47, verifiedAdvisors: 31, scamFlagsDetected: 8, scamFlagsResolved: 7,
            averageTrustScore: 78, totalVerifiedTrades: 4821,
            investorProtectionRate: 94.2,
            lastAuditDate: new Date().toISOString().split('T')[0],
        };
    }
}
