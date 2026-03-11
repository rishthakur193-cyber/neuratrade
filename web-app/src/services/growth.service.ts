export interface RewardData {
    points: number;
    level: number;
    badges: string[];
}

export interface ActivityData {
    id: string;
    userId: string;
    userName: string;
    activityType: 'JOINED' | 'PUBLISHED' | 'EARNED_BADGE' | 'MILESTONE';
    description: string;
    timestamp: string;
}

export interface LeaderboardData {
    topReferrers: {
        id: string;
        name: string;
        count: number;
        points: number;
    }[];
    topEarners: {
        id: string;
        name: string;
        points: number;
        level: number;
    }[];
}

export class GrowthService {
    private static API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/growth`;

    static async getMyRewards(): Promise<RewardData> {
        const token = localStorage.getItem('token');
        const res = await fetch(`${this.API_URL}/rewards`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch rewards');
        const data = await res.json();
        return {
            ...data,
            badges: typeof data.badges === 'string' ? JSON.parse(data.badges) : data.badges
        };
    }

    static async getReferralCode(): Promise<string> {
        const token = localStorage.getItem('token');
        const res = await fetch(`${this.API_URL}/referral-code`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch referral code');
        const data = await res.json();
        return data.referralCode;
    }

    static async getActivities(): Promise<ActivityData[]> {
        const res = await fetch(`${this.API_URL}/activities`);
        if (!res.ok) throw new Error('Failed to fetch activities');
        return await res.json();
    }

    static async getLeaderboard(): Promise<LeaderboardData> {
        const res = await fetch(`${this.API_URL}/leaderboard`);
        if (!res.ok) throw new Error('Failed to fetch leaderboard');
        return await res.json();
    }
}
