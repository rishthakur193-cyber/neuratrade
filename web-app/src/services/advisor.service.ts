import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export class AdvisorService {
    /**
     * Fetches the CRM list of all clients mapped to an Advisor
     */
    static async getClients(advisorUserId: string) {
        if (!advisorUserId) throw new Error("Missing Advisor User ID");

        const db = await initDb();

        // Resolve Advisor Profile
        const profile = await db.get('SELECT * FROM AdvisorProfile WHERE userId = ?', [advisorUserId]);

        if (!profile) {
            throw new Error("Advisor Profile not found");
        }

        // Map clients
        const clients = await db.all(`
      SELECT 
        ac.id as mappingId, 
        ac.status, 
        ac.createdAt as joinedAt,
        u.id as investorId, 
        u.name as investorName, 
        u.email,
        p.totalValue as aum
      FROM AdvisorClient ac
      JOIN User u ON ac.investorId = u.id
      LEFT JOIN Portfolio p ON u.id = p.userId
      WHERE ac.advisorId = ?
    `, [profile.id]);

        return clients;
    }

    /**
     * Approves a lead/prospect to become an active client
     */
    static async acceptLead(advisorUserId: string, investorId: string) {
        const db = await initDb();
        const profile = await db.get('SELECT id FROM AdvisorProfile WHERE userId = ?', [advisorUserId]);

        if (!profile) {
            throw new Error("Advisor Profile not found");
        }

        const acId = randomUUID();

        await db.run(
            'INSERT INTO AdvisorClient (id, advisorId, investorId, status) VALUES (?, ?, ?, ?)',
            [acId, profile.id, investorId, 'ACTIVE']
        );

        return { success: true, message: 'Investor successfully mapped to your CRM' };
    }
}
