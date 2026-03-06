import prisma from './lib/prisma.js';
import bcrypt from 'bcryptjs';
async function syncPasswords() {
    console.log('--- SYNCING TEST PASSWORDS ---');
    const hash = await bcrypt.hash('password123', 10);
    try {
        await prisma.user.updateMany({
            where: { email: { in: ['investor@neuratrade.in', 'advisor@neuratrade.in', 'admin@neuratrade.in'] } },
            data: { passwordHash: hash }
        });
        console.log('✅ Test users updated with password: password123');
    }
    catch (error) {
        console.error('❌ Failed to sync passwords:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
syncPasswords();
