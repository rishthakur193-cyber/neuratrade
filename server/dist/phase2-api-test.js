import axios from 'axios';
const BASE_URL = 'http://localhost:5000/api';
async function testPhase2() {
    console.log('--- STARTING PHASE 2: API ENDPOINT VALIDATION ---');
    try {
        // 1. Authenticate to get a token
        console.log('[Phase 2] Logging in as Investor...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'investor@neuratrade.in',
            password: 'password123' // Base password from earlier seeds or default
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // 2. Test GET /api/auth/me (closest to /api/auth)
        console.log('[Phase 2] Testing GET /api/auth/me...');
        const authRes = await axios.get(`${BASE_URL}/auth/me`, config);
        console.log('✅ /api/auth/me: Status', authRes.status);
        // 3. Test GET /api/advisor-intelligence/leaderboard (closest to /api/advisor/list)
        console.log('[Phase 2] Testing GET /api/advisor-intelligence/leaderboard...');
        const advisorRes = await axios.get(`${BASE_URL}/advisor-intelligence/leaderboard`);
        console.log('✅ /api/advisor-intelligence/leaderboard: Status', advisorRes.status);
        // 4. Test GET /api/matching/ (Investor Dashboard data)
        console.log('[Phase 2] Testing GET /api/matching/...');
        const dashboardRes = await axios.get(`${BASE_URL}/matching/`, config);
        console.log('✅ /api/matching/: Status', dashboardRes.status);
        // 5. Test GET /api/signal/active (Signal Feed)
        console.log('[Phase 2] Testing GET /api/signal/active...');
        const signalRes = await axios.get(`${BASE_URL}/signal/active`);
        console.log('✅ /api/signal/active: Status', signalRes.status);
        console.log('--- PHASE 2 COMPLETED SUCCESSFULLY ---');
    }
    catch (error) {
        console.error('❌ PHASE 2 FAILED:', error.response?.data || error.message);
        process.exit(1);
    }
}
testPhase2();
