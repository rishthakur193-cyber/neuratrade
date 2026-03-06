const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface TrustScoreBreakdown {
    advisorId: string;
    advisorName: string;
    overallScore: number;
    consistency: number;
    riskManagement: number;
    clientFeedback: number;
    transparency: number;
    badge: string;
    summary: string;
}

export class TrustScoreService {
    static async computeAndSave(advisorId: string, token: string): Promise<TrustScoreBreakdown> {
        const res = await fetch(`${API_URL}/advisor-intelligence/trust-score/${advisorId}/compute`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to compute trust score');
        return await res.json();
    }

    static async getCached(advisorId: string, token: string): Promise<TrustScoreBreakdown | null> {
        const res = await fetch(`${API_URL}/advisor-intelligence/trust-score/${advisorId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return null;
        return await res.json();
    }
}
