const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class AuditService {
    /**
     * Records a sensitive operation with context.
     * Note: In the consolidated backend, most logging happens server-side.
     * This client-side helper is for legacy compatibility.
     */
    static async log(token: string, action: string, details: any = {}) {
        if (!token || !action) return;

        try {
            await fetch(`${BASE_URL}/audit/log`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action, details }),
            });
        } catch (err) {
            console.error("Failed to send audit log to server:", err);
        }
    }

    /**
     * Fetches audit history for a user
     */
    static async getLogs(token: string, limit: number = 50) {
        const response = await fetch(`${BASE_URL}/audit/logs?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to fetch logs');
        return result;
    }
}
