
import prisma from './lib/prisma.js';
import { randomUUID } from 'crypto';

async function testPhase3() {
    console.log('--- STARTING PHASE 3: CRUD SMOKE TESTS ---');

    try {
        const testId = randomUUID().substring(0, 8);
        const email = `test-${testId}@example.com`;

        // 1. Create User
        console.log('[Phase 3] Creating User...');
        const user = await prisma.user.create({
            data: {
                id: `u-${testId}`,
                email,
                name: `Test User ${testId}`,
                passwordHash: 'hash',
                role: 'INVESTOR'
            }
        });
        console.log('✅ User created:', user.id);

        // 2. Create InvestorProfile
        console.log('[Phase 3] Creating InvestorProfile...');
        const profile = await prisma.investorProfile.create({
            data: {
                userId: user.id,
                riskScore: 50,
                capitalRange: 'Low',
                riskTolerance: 'Low'
            }
        });
        console.log('✅ InvestorProfile created');

        // 3. Update User (Update test)
        console.log('[Phase 3] Updating User name...');
        await prisma.user.update({
            where: { id: user.id },
            data: { name: `Updated ${testId}` }
        });
        console.log('✅ User updated');

        // 4. Delete (Cleanup)
        console.log('[Phase 3] Deleting Test User (Cascade check)...');
        await prisma.user.delete({ where: { id: user.id } });
        console.log('✅ User deleted');

        // 5. Verify Signal & Performance placeholders
        console.log('[Phase 3] Verifying core model existence (Count check)...');
        const userCount = await prisma.user.count();
        const advisorCount = await prisma.advisorProfile.count();
        console.log(`✅ Counts -> Users: ${userCount}, Advisors: ${advisorCount}`);

        console.log('--- PHASE 3 COMPLETED SUCCESSFULLY ---');
    } catch (error: any) {
        console.error('❌ PHASE 3 FAILED:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testPhase3();
