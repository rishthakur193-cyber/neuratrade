
import axios from 'axios';
import { randomUUID } from 'crypto';

const BASE_URL = 'http://localhost:5000/api';

async function testPhase7() {
    console.log('--- STARTING PHASE 7: PERFORMANCE TRACKING TEST ---');

    try {
        const testId = randomUUID().substring(0, 8);
        const advisorEmail = `adv-perf-${testId}@example.com`;

        // 1. Setup Advisor
        console.log('[Phase 7] Setting up Advisor...');
        await axios.post(`${BASE_URL}/auth/register`, {
            email: advisorEmail,
            name: `AdvPerf ${testId}`,
            password: 'password123',
            role: 'ADVISOR'
        });

        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@neuratrade.in',
            password: 'password123'
        });
        const adminToken = adminLogin.data.token;
        const metrics = await axios.get(`${BASE_URL}/admin/metrics`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const pending = metrics.data.verificationQueue.find((a: any) => a.name === `AdvPerf ${testId}`);
        await axios.post(`${BASE_URL}/admin/verify`, { advisorProfileId: pending.id }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const advisorId = pending.id;

        // 2. Publish 2 Signals
        console.log('[Phase 7] Publishing 2 signals...');
        const advLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: advisorEmail,
            password: 'password123'
        });
        const advToken = advLogin.data.token;

        const s1 = await axios.post(`${BASE_URL}/signal/publish`, {
            symbol: 'WIN_TEST', entryPrice: 100, stopLoss: 90, target: 120, isDirectSignal: false, disclaimerAccepted: true
        }, { headers: { Authorization: `Bearer ${advToken}` } });

        const s2 = await axios.post(`${BASE_URL}/signal/publish`, {
            symbol: 'LOSS_TEST', entryPrice: 100, stopLoss: 90, target: 120, isDirectSignal: false, disclaimerAccepted: true
        }, { headers: { Authorization: `Bearer ${advToken}` } });

        // 3. Close Signals
        console.log('[Phase 7] Closing signals (1 WIN, 1 LOSS)...');
        await axios.post(`${BASE_URL}/signal/close/${s1.data.id}`, { exitPrice: 110 }, { headers: { Authorization: `Bearer ${advToken}` } });
        await axios.post(`${BASE_URL}/signal/close/${s2.data.id}`, { exitPrice: 95 }, { headers: { Authorization: `Bearer ${advToken}` } });

        // 4. Verify Performance & Trust Score
        console.log('[Phase 7] Verifying recalculated metrics...');

        // Wait a bit for async processing if any, though the controller calls them synchronously

        const trustRes = await axios.get(`${BASE_URL}/advisor-intelligence/trust-score/${advisorId}`);
        console.log('✅ Trust Score Overall:', trustRes.data.overallScore);

        // We need to check advisor performance. There might not be a direct public endpoint by ID, let's check the leaderboard or DB directly.
        // Actually getVerifiedProfile(id) in AdvisorIntelligenceController returns performance.
        const profileRes = await axios.get(`${BASE_URL}/advisor-intelligence/performance/${advisorId}`, {
            headers: { Authorization: `Bearer ${advToken}` }
        });

        const performance = profileRes.data.performance;
        if (performance && performance.winRate === 50 && performance.totalTrades === 2) {
            console.log('✅ Performance Metrics Validated: WinRate 50%, Total Trades 2');
            console.log('--- PHASE 7 COMPLETED SUCCESSFULLY ---');
        } else {
            console.error('❌ Performance metrics mismatch:', performance);
            process.exit(1);
        }

    } catch (error: any) {
        console.error('❌ PHASE 7 FAILED:', error.response?.data || error.message);
        process.exit(1);
    }
}

testPhase7();
