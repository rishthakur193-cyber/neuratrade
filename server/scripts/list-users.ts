import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to DB...');
    const users = await prisma.user.findMany({
        take: 5,
        select: {
            email: true,
            role: true
        }
    });
    console.log('Users found:', users.length);
    console.log(JSON.stringify(users, null, 2));
}

main()
    .catch(e => {
        console.error('Error running script:');
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
