const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export type RecoveryStage = 'LEARN' | 'SIMULATE' | 'INVEST';

export interface StageInfo {
    stage: RecoveryStage;
    label: string;
    description: string;
    capitalLimit: number | null;
    requirement: string;
    icon: string;
    color: string;
}

export interface StageProgress {
    userId: string;
    currentStage: RecoveryStage;
    stageProgress: number;
    learnScore: number;
    simulationPnl: number;
    disciplineScore: number;
    capitalUnlocked: number;
    totalSimTrades: number;
    profitableSimTrades: number;
    winRate: number;
    capitalLimit: number | null;
    nextStageRequirement: string;
    isReadyToAdvance: boolean;
    stages: StageInfo[];
}

export class RecoveryPathService {
    static async getProgress(token: string): Promise<StageProgress> {
        const res = await fetch(`${API_URL}/ecosystem/recovery`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch recovery progress');
        return await res.json();
    }

    static async advanceStage(token: string): Promise<{ success: boolean; newStage: RecoveryStage; message: string }> {
        const res = await fetch(`${API_URL}/ecosystem/recovery/advance`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to advance stage');
        return await res.json();
    }
}
