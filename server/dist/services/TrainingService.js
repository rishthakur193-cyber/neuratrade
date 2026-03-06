import prisma from '../lib/prisma.js';
export class TrainingService {
    /**
     * Gets or initializes training progress for a user.
     */
    static async getProgress(userId) {
        let progress = await prisma.courseProgress.findMany({
            where: { userId }
        });
        // Initialize default courses if none exist
        if (progress.length === 0) {
            const defaultCourses = ['NISM-XA', 'SEBI-COMP', 'CLIENT-PSY'];
            await prisma.courseProgress.createMany({
                data: defaultCourses.map(courseId => ({
                    userId,
                    courseId,
                    progress: 0
                }))
            });
            progress = await prisma.courseProgress.findMany({
                where: { userId }
            });
        }
        return progress;
    }
    /**
     * Updates progress for a specific course.
     */
    static async updateProgress(userId, courseId, increment, progress) {
        if (progress !== undefined) {
            const finalProgress = Math.min(Math.max(progress, 0), 100);
            return await prisma.courseProgress.upsert({
                where: { userId_courseId: { userId, courseId } },
                update: { progress: finalProgress, lastAccessed: new Date() },
                create: { userId, courseId, progress: finalProgress }
            });
        }
        const current = await prisma.courseProgress.findUnique({
            where: { userId_courseId: { userId, courseId } }
        });
        const newProgress = Math.min((current?.progress || 0) + (increment || 10), 100);
        return await prisma.courseProgress.upsert({
            where: { userId_courseId: { userId, courseId } },
            update: { progress: newProgress, lastAccessed: new Date() },
            create: { userId, courseId, progress: newProgress }
        });
    }
}
