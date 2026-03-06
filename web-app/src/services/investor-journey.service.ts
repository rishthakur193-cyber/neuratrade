const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class InvestorJourneyService {
    static async getJourney(token: string) {
        const res = await fetch(`${API_URL}/ecosystem/journey`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch journey');
        return await res.json();
    }
}
