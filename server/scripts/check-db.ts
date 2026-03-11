import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing DB connection...');
        const userCount = await prisma.user.count();
        console.log(`User count: ${userCount}`);

        if (userCount > 0) {
            const users = await prisma.user.findMany({ take: 10 });
            console.log('Users found:', JSON.stringify(users, null, 2));
        } else {
            console.log('No users found in database.');
        }
    } catch (err) {
        console.error('Error in main:', err);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

main();
