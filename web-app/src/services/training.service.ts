import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export class TrainingService {
    /**
     * Retrieves the 90-Day SEBI Journey course progress for a trainee.
     */
    static async getProgress(userId: string) {
        if (!userId) throw new Error("Missing user ID");

        const db = await initDb();

        // Attempt to fetch existing progress
        let progressRecords = await db.all('SELECT * FROM CourseProgress WHERE userId = ?', [userId]);

        // If no progress seeded, initiate the default 90D journey
        if (!progressRecords || progressRecords.length === 0) {
            await this.initializeJourney(userId, db);
            progressRecords = await db.all('SELECT * FROM CourseProgress WHERE userId = ?', [userId]);
        }

        return progressRecords;
    }

    /**
     * Updates a specific course percentage for a trainee.
     */
    static async updateProgress(userId: string, courseId: string, progress: number) {
        const db = await initDb();

        await db.run(
            'UPDATE CourseProgress SET progress = ?, lastAccessed = CURRENT_TIMESTAMP WHERE userId = ? AND courseId = ?',
            [progress, userId, courseId]
        );

        return { success: true, message: 'Progress recorded' };
    }

    private static async initializeJourney(userId: string, db: any) {
        const coreCourses = [
            { id: 'NISM-XA', name: 'NISM Series X-A: Investment Adviser (Level 1)' },
            { id: 'SEBI-COMP', name: 'SEBI Compliance & Fiduciary Duties' },
            { id: 'CLIENT-PSY', name: 'Client Psychology & Behavioral Finance' }
        ];

        for (const course of coreCourses) {
            await db.run(
                'INSERT INTO CourseProgress (id, userId, courseId, progress) VALUES (?, ?, ?, ?)',
                [randomUUID(), userId, course.id, 0]
            );
        }
    }
}
