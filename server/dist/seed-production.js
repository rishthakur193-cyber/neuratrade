import prisma from './lib/prisma.js';
import { randomUUID } from 'crypto';
async function seed() {
    console.log('--- STARTING PRODUCTION-READY SEED ---');
    try {
        // 1. Create Admin
        const admin = await prisma.user.upsert({
            where: { email: 'admin@neuratrade.in' },
            update: {},
            create: {
                id: 'admin-root-001',
                email: 'admin@neuratrade.in',
                passwordHash: '$2b$10$7vNfV0/XgYv.zV.f.yX... (dummy)',
                name: 'System Administrator',
                role: 'ADMIN'
            }
        });
        console.log('✅ Admin User Created:', admin.id);
        // 2. Create Advisor
        const advisorUser = await prisma.user.upsert({
            where: { email: 'advisor@neuratrade.in' },
            update: {},
            create: {
                id: 'advisor-pro-001',
                email: 'advisor@neuratrade.in',
                passwordHash: '$2b$10$7vNfV0/XgYv.zV.f.yX... (dummy)',
                name: 'Pro Trader SEBI',
                role: 'ADVISOR'
            }
        });
        const advisorProfile = await prisma.advisorProfile.upsert({
            where: { userId: advisorUser.id },
            update: {},
            create: {
                id: 'adv-profile-001',
                userId: advisorUser.id,
                sebiRegNo: 'INH000001234',
                isVerified: true,
                status: 'VERIFIED',
                tier: 'PRO_SHIELD',
                classification: 'SEBI_REGISTERED'
            }
        });
        console.log('✅ Advisor Profile Created:', advisorProfile.id);
        // 3. Create Broker Link for Advisor
        const brokerLink = await prisma.advisorBrokerLink.upsert({
            where: { advisorId: advisorProfile.id },
            update: { isActive: true },
            create: {
                advisorId: advisorProfile.id,
                brokerName: 'AngelOne',
                clientCode: 'ANGEL-PRO-001',
                encryptedToken: 'encrypted_token_placeholder',
                feedToken: 'feed_token_placeholder',
                isActive: true
            }
        });
        console.log('✅ Broker Link (AngelOne) Established for Advisor');
        // 4. Create Investor
        const investorUser = await prisma.user.upsert({
            where: { email: 'investor@neuratrade.in' },
            update: {},
            create: {
                id: 'investor-001',
                email: 'investor@neuratrade.in',
                passwordHash: '$2b$10$7vNfV0/XgYv.zV.f.yX... (dummy)',
                name: 'Smart Investor',
                role: 'INVESTOR'
            }
        });
        await prisma.investorProfile.upsert({
            where: { userId: investorUser.id },
            update: {},
            create: {
                userId: investorUser.id,
                riskScore: 65,
                capitalRange: 'Medium',
                riskTolerance: 'Moderate'
            }
        });
        console.log('✅ Investor Profile Created');
        console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
    }
    catch (error) {
        console.error('❌ SEEDING FAILED:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
seed();
