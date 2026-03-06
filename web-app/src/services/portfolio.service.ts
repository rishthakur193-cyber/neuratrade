const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class PortfolioService {
    /**
     * Fetches the entire portfolio overview for an investor
     */
    static async getOverview(token: string) {
        if (!token) throw new Error("Authentication token required");

        const response = await fetch(`${BASE_URL}/portfolio/overview`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch portfolio overview');
        return result;
    }

    /**
     * Executes a mock trade on the server
     */
    static async mockTrade(token: string, assetSymbol: string, type: 'BUY' | 'SELL', quantity: number, price: number) {
        if (!token) throw new Error("Authentication token required");

        const response = await fetch(`${BASE_URL}/portfolio/mock-trade`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ assetSymbol, type, quantity, price }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Trade execution failed');
        return result;
    }

    /**
     * Real trade execution via Broker API (on server)
     * For now, keeping the signature but it should eventually be fully server-side.
     */
    static async placeRealTrade(token: string, orderDetails: any) {
        if (!token) throw new Error("Authentication token required");
        // This should probably be a POST to /portfolio/trade on the server
        // For now, let's just mark it as todo or point to a placeholder
        throw new Error("Real trading migration in progress. Use mock trading for now.");
    }
}
