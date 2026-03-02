import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export class AuditService {
    /**
     * Records a sensitive operation with context.
     */
    static async log(userId: string, action: string, details: any = {}, ip: string = 'unknown', userAgent: string = 'unknown') {
        if (!userId || !action) return;

        try {
            const db = await initDb();
            const id = randomUUID();

            await db.run(
                'INSERT INTO AuditLog (id, userId, action, details, ipAddress, userAgent) VALUES (?, ?, ?, ?, ?, ?)',
                [id, userId, action, JSON.stringify(details), ip, userAgent]
            );
        } catch (err) {
            console.error("Failed to write audit log:", err);
        }
    }

    /**
     * Fetches audit history for a user (admin or self)
     */
    static async getLogs(userId: string, limit: number = 50) {
        const db = await initDb();
        return await db.all(
            'SELECT * FROM AuditLog WHERE userId = ? ORDER BY createdAt DESC LIMIT ?',
            [userId, limit]
        );
    }
}
