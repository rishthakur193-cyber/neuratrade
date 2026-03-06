import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

/**
 * Admin Complaint Service — Phase 4 of Polish & Trust Mode
 */

export interface Complaint {
    id: string;
    userId: string;
    category: 'ADVISOR_MISCONDUCT' | 'PAYMENT_ISSUE' | 'TECHNICAL_BUG' | 'OTHER';
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    createdAt: string;
}

export class AdminComplaintService {
    /**
     * Submit a new complaint.
     */
    static async submitComplaint(userId: string, category: string, description: string) {
        const db = await initDb();
        const id = randomUUID();
        const createdAt = new Date().toISOString();

        await db.run(`
      INSERT INTO AuditLog (id, userId, action, details, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `, [id, userId, 'COMPLAINT_SUBMITTED', JSON.stringify({ category, description, status: 'OPEN' }), createdAt]);

        return { id, success: true };
    }

    /**
     * List all complaints for admin.
     */
    static async listComplaints() {
        const db = await initDb();
        const logs = await db.all("SELECT * FROM AuditLog WHERE action = 'COMPLAINT_SUBMITTED' ORDER BY createdAt DESC");

        return logs.map(log => ({
            id: log.id,
            userId: log.userId,
            ...JSON.parse(log.details || '{}'),
            createdAt: log.createdAt
        }));
    }

    /**
     * Update complaint status.
     */
    static async updateStatus(id: string, status: string) {
        const db = await initDb();
        const log = await db.get('SELECT details FROM AuditLog WHERE id = ?', [id]);
        if (!log) throw new Error('Complaint not found');

        const details = JSON.parse(log.details);
        details.status = status;

        await db.run('UPDATE AuditLog SET details = ? WHERE id = ?', [JSON.stringify(details), id]);
        return { success: true };
    }
}
