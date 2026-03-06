import prisma from '../lib/prisma.js';
import { AuditService } from './AuditService.js';

export class PlatformSubscriptionService {
    static async upgradePlan(userId: string, plan: string, amount: number, method: string) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now

        const subscription = await prisma.platformSubscription.upsert({
            where: { userId },
            update: {
                tier: plan,
                expiresAt,
                status: 'ACTIVE',
                updatedAt: new Date()
            },
            create: {
                userId,
                tier: plan,
                status: 'ACTIVE',
                expiresAt
            }
        });

        await AuditService.log(userId, 'PLATFORM_SUBSCRIPTION_UPGRADE', { plan, amount, method });

        return subscription;
    }

    static async getSubscription(userId: string) {
        return await prisma.platformSubscription.findUnique({
            where: { userId }
        });
    }
}
