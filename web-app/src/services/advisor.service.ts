const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class AdvisorService {
    /**
     * Fetches the CRM list of all clients mapped to an Advisor
     */
    static async getClients(token: string) {
        if (!token) throw new Error("Authentication token required");

        const response = await fetch(`${BASE_URL}/advisor/clients`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch clients');
        return result;
    }

    /**
     * Approves a lead/prospect to become an active client
     */
    static async acceptLead(token: string, investorId: string) {
        if (!token) throw new Error("Authentication token required");

        const response = await fetch(`${BASE_URL}/advisor/accept-lead`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ investorId }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to accept lead');
        return result;
    }
}
