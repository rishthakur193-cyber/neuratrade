export interface PerformanceLeaderboardEntry {
    advisorId: string;
    advisorName: string;
    sebiRegNo: string;
    badgeLevel: string;
    verifiedTradeCount: number;
    totalTradeCount: number;
    verificationPct: number;
}

export class PerformanceService {
    private static API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/advisor-intelligence`;

    static async getLeaderboard(): Promise<PerformanceLeaderboardEntry[]> {
        const res = await fetch(`${this.API_URL}/leaderboard`);
        if (!res.ok) throw new Error('Failed to fetch performance leaderboard');
        return await res.json();
    }
}
