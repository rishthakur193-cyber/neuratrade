const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class StrategyIntelligenceService {
    static async getIntelligence() {
        const res = await fetch(`${API_URL}/ecosystem/strategy-intelligence`);
        if (!res.ok) throw new Error('Failed to fetch strategy intelligence');
        return await res.json();
    }
}
