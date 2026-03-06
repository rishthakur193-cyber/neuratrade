import prisma from './lib/prisma.js';
async function verifyAdminLogic() {
    console.log('--- STARTING ADMIN LOGIC VERIFICATION ---');
    try {
        const userCount = await prisma.user.count();
        const verifiedAdvisors = await prisma.advisorProfile.count({ where: { isVerified: true } });
        const pendingQueue = await prisma.advisorProfile.findMany({
            where: { isVerified: false },
            include: { user: { select: { name: true } } }
        });
        console.log('✅ Total Users:', userCount);
        console.log('✅ Verified Advisors:', verifiedAdvisors);
        console.log('✅ Verification Queue Length:', pendingQueue.length);
        if (userCount >= 3 && verifiedAdvisors >= 1) {
            console.log('--- ADMIN LOGIC VERIFICATION SUCCESSFUL ---');
        }
        else {
            console.error('❌ Data mismatch: Expected at least 3 users and 1 verified advisor.');
            process.exit(1);
        }
    }
    catch (error) {
        console.error('❌ VERIFICATION FAILED:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
verifyAdminLogic();
