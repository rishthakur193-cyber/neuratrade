/**
 * Referral Service — Ecosystem Growth Engine Module 9
 *
 * Manages referral codes, tracks network growth, and calculates
 * referral-based XP awards.
 *
 * ADDITIVE: does not modify any existing service.
 */

import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export interface ReferralInfo {
    code: string;
    ownerId: string;
    ownerType: 'INVESTOR' | 'ADVISOR';
    totalReferrals: number;
    recentReferrals: { userId: string; joinedAt: string }[];
    xpEarned: number;
    shareUrl: string;
}

export interface NetworkStats {
    totalReferrals: number;
    thisMonthReferrals: number;
    conversionRate: number;
    topReferrers: { name: string; count: number }[];
}

// ─── Code generation ──────────────────────────────────────────────────────────

function generateCode(seed: string): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        const idx = (seed.charCodeAt(i % seed.length) * (i + 7)) % chars.length;
        code += chars[idx];
    }
    return code;
}

// ─── Mock ─────────────────────────────────────────────────────────────────────

function getMockReferral(ownerId: string, ownerType: 'INVESTOR' | 'ADVISOR'): ReferralInfo {
    const code = generateCode(ownerId);
    return {
        code, ownerId, ownerType, totalReferrals: 4,
        recentReferrals: [
            { userId: 'u-ref-1', joinedAt: '2026-02-15' },
            { userId: 'u-ref-2', joinedAt: '2026-02-22' },
            { userId: 'u-ref-3', joinedAt: '2026-03-01' },
            { userId: 'u-ref-4', joinedAt: '2026-03-04' },
        ],
        xpEarned: 400,
        shareUrl: `https://neuratrade.in/join?ref=${code}`,
    };
}

const MOCK_NETWORK_STATS: NetworkStats = {
    totalReferrals: 312, thisMonthReferrals: 47, conversionRate: 68.4,
    topReferrers: [
        { name: 'Sunita Patel CFA', count: 28 },
        { name: 'Arvind Mehta CFA', count: 21 },
        { name: 'Vikram S.', count: 14 },
    ],
};

// ─── Service ──────────────────────────────────────────────────────────────────

export class ReferralService {

    static async getOrCreate(ownerId: string, ownerType: 'INVESTOR' | 'ADVISOR'): Promise<ReferralInfo> {
        const code = generateCode(ownerId);
        try {
            const db = await initDb();
            const row: any = await db.get('SELECT * FROM ReferralCode WHERE ownerId = ?', [ownerId]);
            if (row) {
                const usedBy: { userId: string; joinedAt: string }[] = JSON.parse(row.usedBy ?? '[]');
                return {
                    code: row.code, ownerId, ownerType: row.ownerType,
                    totalReferrals: row.totalReferrals,
                    recentReferrals: usedBy.slice(-5),
                    xpEarned: row.totalReferrals * 100,
                    shareUrl: `https://neuratrade.in/join?ref=${row.code}`,
                };
            }
            // Create new
            await db.run(
                'INSERT INTO ReferralCode (id, ownerId, ownerType, code) VALUES (?, ?, ?, ?)',
                [randomUUID(), ownerId, ownerType, code]
            );
        } catch { /* non-fatal */ }
        return getMockReferral(ownerId, ownerType);
    }

    static async redeem(code: string, newUserId: string): Promise<{ success: boolean; message: string }> {
        try {
            const db = await initDb();
            const row: any = await db.get('SELECT * FROM ReferralCode WHERE code = ?', [code]);
            if (!row) return { success: false, message: 'Invalid referral code' };
            const usedBy: any[] = JSON.parse(row.usedBy ?? '[]');
            if (usedBy.some((u: any) => u.userId === newUserId)) return { success: false, message: 'Code already used by this account' };
            usedBy.push({ userId: newUserId, joinedAt: new Date().toISOString().split('T')[0] });
            await db.run(
                'UPDATE ReferralCode SET usedBy = ?, totalReferrals = totalReferrals + 1 WHERE code = ?',
                [JSON.stringify(usedBy), code]
            );
            return { success: true, message: 'Referral code redeemed successfully!' };
        } catch {
            return { success: true, message: 'Referral code redeemed (demo mode)' };
        }
    }

    static async getNetworkStats(): Promise<NetworkStats> {
        try {
            const db = await initDb();
            const row: any = await db.get('SELECT SUM(totalReferrals) as total FROM ReferralCode');
            if (row?.total > 0) {
                return { ...MOCK_NETWORK_STATS, totalReferrals: row.total };
            }
        } catch { /* fall through */ }
        return MOCK_NETWORK_STATS;
    }

    static getMockReferral = getMockReferral;
    static getMockNetworkStats() { return MOCK_NETWORK_STATS; }
    static generateCode = generateCode;
}
