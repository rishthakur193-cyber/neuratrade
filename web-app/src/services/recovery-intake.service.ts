/**
 * Recovery Intake Service — Module 1
 *
 * Collects loss experience data, computes Recovery Profile:
 * - Loss Level (LOW / MEDIUM / HIGH / SEVERE)
 * - Recovery Path (LEARNING / GUIDED / CONTROLLED)
 * - Recommended next action
 */

import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export type LossLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
export type LossSource = 'SELF' | 'ADVISOR' | 'BOTH';
export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type RecoveryPath = 'LEARNING' | 'GUIDED' | 'CONTROLLED';

export interface RecoveryProfileInput {
    totalLossAmt: number;
    lossSource: LossSource;
    experienceLevel: ExperienceLevel;
    confidenceLevel: number; // 1–10
    availableCapital: number;
}

export interface RecoveryProfileResult {
    id: string;
    userId: string;
    totalLossAmt: number;
    lossSource: LossSource;
    experienceLevel: ExperienceLevel;
    confidenceLevel: number;
    availableCapital: number;
    lossLevel: LossLevel;
    recoveryPath: RecoveryPath;
    pathLabel: string;
    recommendation: string;
    createdAt: string;
}

// ─── Logic ────────────────────────────────────────────────────────────────────

function computeLossLevel(amount: number): LossLevel {
    if (amount >= 500000) return 'SEVERE';
    if (amount >= 100000) return 'HIGH';
    if (amount >= 25000) return 'MEDIUM';
    return 'LOW';
}

function computePath(lossLevel: LossLevel, confidence: number): RecoveryPath {
    if (lossLevel === 'SEVERE' || (lossLevel === 'HIGH' && confidence <= 4)) return 'LEARNING';
    if (lossLevel === 'HIGH' || (lossLevel === 'MEDIUM' && confidence <= 5)) return 'GUIDED';
    return 'CONTROLLED';
}

const PATH_LABELS: Record<RecoveryPath, string> = {
    LEARNING: 'Guided Learning + Paper Trading',
    GUIDED: 'Guided Paper Trading with Safe Advisors',
    CONTROLLED: 'Controlled Investing with Capital Limits',
};

const RECOMMENDATIONS: Record<RecoveryPath, string> = {
    LEARNING: 'Start with the Learning Stage. Complete all modules before simulating any trades.',
    GUIDED: 'Begin paper trading under a verified advisor. Aim for 3 profitable simulated months before deploying capital.',
    CONTROLLED: 'Start investing small (max ₹10,000) with strict stop-losses and a verified advisor.',
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

function getMockProfile(userId: string): RecoveryProfileResult {
    return {
        id: `mock-rp-${userId}`, userId,
        totalLossAmt: 150000, lossSource: 'ADVISOR', experienceLevel: 'BEGINNER',
        confidenceLevel: 3, availableCapital: 50000,
        lossLevel: 'HIGH', recoveryPath: 'LEARNING',
        pathLabel: PATH_LABELS.LEARNING, recommendation: RECOMMENDATIONS.LEARNING,
        createdAt: new Date().toISOString(),
    };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class RecoveryIntakeService {

    static async createProfile(userId: string, input: RecoveryProfileInput): Promise<RecoveryProfileResult> {
        const lossLevel = computeLossLevel(input.totalLossAmt);
        const path = computePath(lossLevel, input.confidenceLevel);
        const id = randomUUID();

        try {
            const db = await initDb();
            await db.run(
                `INSERT INTO RecoveryProfile
           (id, userId, totalLossAmt, lossSource, experienceLevel, confidenceLevel, availableCapital, lossLevel, recoveryPath)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, userId, input.totalLossAmt, input.lossSource, input.experienceLevel,
                    input.confidenceLevel, input.availableCapital, lossLevel, path]
            );

            // Initialise progress record
            await db.run(
                `INSERT OR IGNORE INTO RecoveryProgress (id, userId, currentStage, capitalUnlocked)
         VALUES (?, ?, 'LEARN', 0)`,
                [randomUUID(), userId]
            );
        } catch { /* non-fatal in demo mode */ }

        return {
            id, userId, ...input, lossLevel, recoveryPath: path,
            pathLabel: PATH_LABELS[path], recommendation: RECOMMENDATIONS[path],
            createdAt: new Date().toISOString(),
        };
    }

    static async getProfile(userId: string): Promise<RecoveryProfileResult | null> {
        try {
            const db = await initDb();
            const row: any = await db.get('SELECT * FROM RecoveryProfile WHERE userId = ?', [userId]);
            if (!row) return null;
            const path = row.recoveryPath as RecoveryPath;
            return { ...row, pathLabel: PATH_LABELS[path], recommendation: RECOMMENDATIONS[path] };
        } catch {
            return null;
        }
    }

    static getMockProfile = getMockProfile;
    static computePath = computePath;
    static computeLossLevel = computeLossLevel;
}
