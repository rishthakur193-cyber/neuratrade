import prisma from '../lib/prisma.js';
import { randomUUID } from 'crypto';

export class GrowthService {
    /**
     * Records a new social activity to the feed.
     */
    static async logActivity(userId: string, type: string, content: string, metadata?: any) {
        try {
            return await (prisma.socialActivity as any).create({
                data: {
                    userId,
                    type,
                    content,
                    metadata: metadata ? JSON.stringify(metadata) : null
                }
            });
        } catch (error) {
            console.error('[GrowthService] Error logging activity:', error);
        }
    }

    /**
     * Adds reward points to a user and handles level-ups.
     */
    static async addPoints(userId: string, points: number, reason: string) {
        try {
            const currentRewards = await (prisma.userRewards as any).upsert({
                where: { userId },
                update: {
                    points: { increment: points },
                    lastUpdated: new Date()
                },
                create: {
                    userId,
                    points,
                    level: 1
                }
            });

            // Handle Level Up (Simple logic: Every 500 points = new level)
            const newLevel = Math.floor(currentRewards.points / 500) + 1;
            if (newLevel > currentRewards.level) {
                await (prisma.userRewards as any).update({
                    where: { userId },
                    data: { level: newLevel }
                });

                await this.logActivity(userId, 'RANK_UP', `Levelled up to Level ${newLevel}!`, { newLevel });
            }

            // Log activity
            await this.logActivity(userId, 'REWARD_EARNED', `Earned ${points} points for ${reason}`, { points, reason });

            return currentRewards;
        } catch (error) {
            console.error('[GrowthService] Error adding points:', error);
        }
    }

    /**
     * Handles referral attribution when a new user signs up.
     */
    static async processReferral(newUserId: string, referralCode: string) {
        if (!referralCode) return;

        try {
            const referrer = await prisma.user.findUnique({
                where: { referralCode }
            });

            if (!referrer) {
                console.warn(`[GrowthService] Invalid referral code used: ${referralCode}`);
                return;
            }

            // Create referral record
            await (prisma.referral as any).create({
                data: {
                    referrerId: referrer.id,
                    referredUserId: newUserId,
                    rewardPoints: 100, // Fixed reward for referring
                    status: 'SUCCESSFUL'
                }
            });

            // Credit referrer
            await this.addPoints(referrer.id, 100, 'referring a new user');

            // Credit new user (welcome bonus)
            await this.addPoints(newUserId, 50, 'joining via referral');

            await this.logActivity(referrer.id, 'REFERRAL_SUCCESS', `Successfully invited someone to NeuraTrade!`);

        } catch (error) {
            console.error('[GrowthService] Error processing referral:', error);
        }
    }

    /**
     * Fetches the global growth leaderboard.
     */
    static async getGrowthLeaderboard() {
        // Top Referrers
        const topReferrers = await (prisma.referral as any).groupBy({
            by: ['referrerId'],
            _count: {
                id: true
            },
            _sum: {
                rewardPoints: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 10
        });

        // Enrich with user names
        const enrichedReferrers = await Promise.all(topReferrers.map(async (r: any) => {
            const user = await prisma.user.findUnique({
                where: { id: r.referrerId },
                select: { name: true }
            });
            return {
                id: r.referrerId,
                name: user?.name || 'Anonymous',
                count: r._count.id,
                points: r._sum.rewardPoints
            };
        }));

        // Top Point Earners
        const topEarners = await (prisma.userRewards as any).findMany({
            include: {
                user: { select: { name: true } }
            },
            orderBy: { points: 'desc' },
            take: 10
        });

        return {
            topReferrers: enrichedReferrers,
            topEarners: topEarners.map((e: any) => ({
                id: e.userId,
                name: e.user.name,
                points: e.points,
                level: e.level
            }))
        };
    }

    /**
     * Fetches the latest social activities.
     */
    static async getRecentActivities(limit = 20) {
        return await (prisma.socialActivity as any).findMany({
            include: {
                user: { select: { name: true, role: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }
}
