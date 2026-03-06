/**
 * Advisor Flow Verification Test
 * Tests: Advisor Registration, Profile Fields, and Training Progress.
 */

const BASE = 'http://localhost:3000';
const RUN_ID = `advisor_test_${Date.now()}`;
const EMAIL = `${RUN_ID}@test.neuratrade`;
const PASS = 'AdvisorTest@123';

async function test() {
    console.log(`Starting Advisor Flow Test [${RUN_ID}]...`);

    // 1. Register as Advisor
    console.log('\nStep 1: Registering Advisor...');
    const regRes = await fetch(`${BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Verification Advisor',
            email: EMAIL,
            password: PASS,
            role: 'ADVISOR',
            sebiRegNo: `INA${Math.floor(Math.random() * 1000000)}`,
            yearsOfExperience: "8",
            mandateScale: "ELITE: 50 - 100 CR"
        })
    });

    const regData = await regRes.json();
    if (!regRes.ok) {
        console.error('❌ Registration Failed:', regData);
        process.exit(1);
    }
    console.log('✅ Registration Successful');

    // 2. Login
    console.log('\nStep 2: Authenticating...');
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASS })
    });
    const { token } = await loginRes.json();
    if (!token) {
        console.error('❌ Login Failed');
        process.exit(1);
    }
    console.log('✅ Authentication Successful');

    // 3. Verify Profile
    console.log('\nStep 3: Verifying Advisor Profile...');
    const meRes = await fetch(`${BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    const profile = meData.advisorProfile;

    if (profile && profile.professionalVintage === 8 && profile.mandateScale === 'ELITE: 50 - 100 CR') {
        console.log('✅ Advisor Profile fields verified');
    } else {
        console.error('❌ Advisor Profile fields mismatch:', profile);
        process.exit(1);
    }

    // 4. Register as Trainee & Check Progress
    console.log('\nStep 4: Registering Trainee & Checking Progress...');
    const tEmail = `trainee_${RUN_ID}@test.neuratrade`;
    await fetch(`${BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Verification Trainee', email: tEmail, password: PASS, role: 'TRAINEE' })
    });

    const tLoginRes = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tEmail, password: PASS })
    });
    const tToken = (await tLoginRes.json()).token;

    const progRes = await fetch(`${BASE}/api/training/progress`, {
        headers: { 'Authorization': `Bearer ${tToken}` }
    });
    const progData = await progRes.json();

    if (progData.progress && progData.progress.length === 3) {
        console.log('✅ Trainee Progress initialized with 3 courses');
    } else {
        console.error('❌ Trainee Progress initialization failed:', progData);
        process.exit(1);
    }

    console.log('\nALL ADVISOR FLOW CHECKS PASSED ✅');
}

test().catch(e => {
    console.error('Fatal Test Error:', e);
    process.exit(1);
});
