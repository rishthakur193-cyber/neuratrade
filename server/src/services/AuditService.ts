import prisma from '../lib/prisma.js';

export class AuditService {
    /**
     * Records a sensitive operation with context.
     */
    static async log(userId: string, action: string, details: any = {}, ip: string = 'unknown', userAgent: string = 'unknown') {
        if (!userId || !action) return;

        try {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action,
                    details: JSON.stringify(details),
                    ipAddress: ip,
                    userAgent: userAgent
                }
            });
        } catch (err) {
            console.error("Failed to write audit log:", err);
        }
    }

    /**
     * Fetches audit history for a user (admin or self)
     */
    static async getLogs(userId: string, limit: number = 50) {
        return await prisma.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }
}
