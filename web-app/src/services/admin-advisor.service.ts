import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

/**
 * Admin Advisor Service — Phase 2 of Admin Control Panel
 */

export class AdminAdvisorService {
    /**
     * List all advisors (with sensitive data for admin).
     */
    static async listAllAdvisors() {
        const db = await initDb();
        return db.all(`
      SELECT ap.*, u.name, u.email, u.kycStatus
      FROM AdvisorProfile ap
      JOIN User u ON ap.userId = u.id
      ORDER BY ap.createdAt DESC
    `);
    }

    /**
     * Approve an advisor.
     */
    static async approveAdvisor(advisorId: string) {
        const db = await initDb();
        await db.run(
            'UPDATE AdvisorProfile SET isVerified = 1 WHERE id = ?',
            [advisorId]
        );
        return { success: true, message: 'Advisor approved' };
    }

    /**
     * Suspend/Deactivate an advisor.
     */
    static async suspendAdvisor(advisorId: string) {
        const db = await initDb();
        await db.run(
            'UPDATE AdvisorProfile SET isActive = 0 WHERE id = ?',
            [advisorId]
        );
        return { success: true, message: 'Advisor suspended' };
    }

    /**
     * Update advisor's subscription price.
     * Note: This might require adding a price column to AdvisorProfile if it's not there.
     */
    static async updatePricing(advisorId: string, price: number) {
        const db = await initDb();
        // Assuming we add a basePrice column or handle it via a separate Pricing table
        await db.run(
            'UPDATE AdvisorProfile SET basePrice = ? WHERE id = ?',
            [price, advisorId]
        );
        return { success: true, message: 'Pricing updated' };
    }
}
