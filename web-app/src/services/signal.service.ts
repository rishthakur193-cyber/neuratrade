const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Signal {
    id: string;
    advisorId: string;
    advisorName: string;
    classification?: string;
    symbol: string;
    entryPrice: number;
    stopLoss: number;
    target: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    tradeReason: string;
    isActiveSignal: boolean;
    isDirectSignal?: boolean;
    entryHit?: boolean;
    targetHit?: boolean;
    stopLossHit?: boolean;
    result?: 'WIN' | 'LOSS' | 'BREAKEVEN';
    returnPct?: number;
    tradedAt: string;
}

export class SignalService {
    static async getActiveSignals(): Promise<Signal[]> {
        const res = await fetch(`${API_URL}/signals/active`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.map((s: any) => ({
            ...s,
            advisorName: s.advisorName || s.advisor?.user?.name || 'Unknown',
            tradedAt: s.timestamp || s.tradedAt
        }));
    }

    static async publishSignal(token: string, data: {
        symbol: string;
        entryPrice: number;
        stopLoss: number;
        target: number;
        riskLevel: string;
        tradeReason: string;
        isDirectSignal: boolean;
        disclaimerAccepted: boolean;
    }): Promise<Signal> {
        const res = await fetch(`${API_URL}/signals/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to publish signal');
        }

        return await res.json();
    }

    static async closeSignal(token: string, signalId: string, exitPrice: number): Promise<Signal> {
        const res = await fetch(`${API_URL}/signals/close/${signalId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ exitPrice })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to close signal');
        }

        return await res.json();
    }
}
