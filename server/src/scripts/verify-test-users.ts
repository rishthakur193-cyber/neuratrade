
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verify() {
    console.log('--- VERIFYING TEST ACCOUNTS ---');

    const accounts = [
        { email: 'admin@neuratrade.com', password: 'Admin@123', expectedRole: 'ADMIN' },
        { email: 'advisor@neuratrade.com', password: 'Advisor@123', expectedRole: 'ADVISOR' },
        { email: 'investor@neuratrade.com', password: 'Investor@123', expectedRole: 'INVESTOR' }
    ];

    for (const acc of accounts) {
        const user = await prisma.user.findUnique({ where: { email: acc.email } });
        if (!user) {
            console.error(`❌ User ${acc.email} not found!`);
            continue;
        }

        const isValid = await bcrypt.compare(acc.password, user.passwordHash);
        if (isValid && user.role === acc.expectedRole) {
            console.log(`✅ ${acc.email} verified (Role: ${user.role})`);
        } else {
            console.error(`❌ ${acc.email} verification FAILED! Result: validPwd=${isValid}, actualRole=${user.role}`);
        }
    }

    await prisma.$disconnect();
}

verify().catch(console.error);
