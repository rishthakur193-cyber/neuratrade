
import prisma from './lib/prisma.js';

async function smokeTest() {
    console.log('--- STARTING CRUD SMOKE TEST ---');
    try {
        const timestamp = Date.now();
        // 1. Create a test user
        const user = await prisma.user.create({
            data: {
                id: 'test-user-id-' + timestamp,
                email: 'smoke-test-' + timestamp + '@example.com',
                passwordHash: 'hashedpassword',
                name: 'Smoke Test User',
                role: 'INVESTOR'
            }
        });
        console.log('✅ User Created:', user.id);

        // 2. Create Investor Profile
        const profile = await prisma.investorProfile.create({
            data: {
                userId: user.id,
                riskScore: 75,
                capitalRange: 'Medium'
            }
        });
        console.log('✅ Investor Profile Created:', profile.id);

        // 3. Create Advisor Profile
        const advisor = await prisma.advisorProfile.create({
            data: {
                userId: user.id,
                sebiRegNo: 'SMOKE-TEST-REG-' + timestamp,
                isVerified: true,
                tier: 'PRO_SHIELD'
            }
        });
        console.log('✅ Advisor Profile Created:', advisor.id);

        // 4. Create Signal
        const signal = await prisma.advisorRecommendation.create({
            data: {
                advisorId: advisor.id,
                symbol: 'TEST-ASSET',
                entryPrice: 100,
                target: 120,
                stopLoss: 90,
                riskLevel: 'MEDIUM',
                isActiveSignal: true,
                tradedAt: new Date()
            }
        });
        console.log('✅ Signal Created:', signal.id);

        console.log('--- SMOKE TEST SUCCESSFUL ---');
    } catch (error) {
        console.error('❌ SMOKE TEST FAILED:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

smokeTest();
