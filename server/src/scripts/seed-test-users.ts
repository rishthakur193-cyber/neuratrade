
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
    console.log('--- SEEDING TEST ACCOUNTS ---');

    const accounts = [
        {
            name: 'Admin User',
            email: 'admin@neuratrade.com',
            password: 'Admin@123',
            role: 'ADMIN',
        },
        {
            name: 'Advisor User',
            email: 'advisor@neuratrade.com',
            password: 'Advisor@123',
            role: 'ADVISOR',
        },
        {
            name: 'Investor User',
            email: 'investor@neuratrade.com',
            password: 'Investor@123',
            role: 'INVESTOR',
        }
    ];

    for (const acc of accounts) {
        const existing = await prisma.user.findUnique({ where: { email: acc.email } });
        const passwordHash = await bcrypt.hash(acc.password, 10);

        if (existing) {
            console.log(`Updating ${acc.email}...`);
            await prisma.user.update({
                where: { email: acc.email },
                data: { passwordHash, role: acc.role }
            });
        } else {
            console.log(`Creating ${acc.email}...`);
            const user = await prisma.user.create({
                data: {
                    name: acc.name,
                    email: acc.email,
                    passwordHash,
                    role: acc.role
                }
            });

            // Initialize profiles based on role
            if (acc.role === 'ADVISOR') {
                await prisma.advisorProfile.create({
                    data: {
                        userId: user.id,
                        sebiRegNo: `INA${Math.floor(100000 + Math.random() * 900000)}`,
                        tier: 'Registered',
                        isVerified: true,
                        status: 'VERIFIED'
                    }
                });
            } else if (acc.role === 'INVESTOR') {
                await prisma.investorProfile.create({
                    data: {
                        userId: user.id,
                        riskTolerance: 'Moderate'
                    }
                });
            }
        }
    }

    console.log('✅ Seeding complete.');
    await prisma.$disconnect();
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
