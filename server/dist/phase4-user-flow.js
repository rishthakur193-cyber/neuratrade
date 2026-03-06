import axios from 'axios';
import { randomUUID } from 'crypto';
const BASE_URL = 'http://localhost:5000/api';
async function testPhase4() {
    console.log('--- STARTING PHASE 4: USER FLOW SIMULATION ---');
    try {
        const testId = randomUUID().substring(0, 8);
        const investorEmail = `investor-${testId}@example.com`;
        const advisorEmail = `advisor-${testId}@example.com`;
        // 1. Register Investor
        console.log('[Phase 4] Registering Investor...');
        const invReg = await axios.post(`${BASE_URL}/auth/register`, {
            email: investorEmail,
            name: `Investor ${testId}`,
            password: 'password123',
            role: 'INVESTOR'
        });
        console.log('✅ Investor Registered');
        // 2. Register Advisor
        console.log('[Phase 4] Registering Advisor...');
        const advReg = await axios.post(`${BASE_URL}/auth/register`, {
            email: advisorEmail,
            name: `Advisor ${testId}`,
            password: 'password123',
            role: 'ADVISOR'
        });
        const advisorUserId = advReg.data.userId;
        console.log('✅ Advisor Registered. UserID:', advisorUserId);
        // 3. Login as Admin to approve
        console.log('[Phase 4] Logging in as Admin to approve advisor...');
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@neuratrade.in',
            password: 'password123'
        });
        const adminToken = adminLogin.data.token;
        // Find Advisor Profile ID
        const searchRes = await axios.get(`${BASE_URL}/admin/metrics`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        const pending = searchRes.data.verificationQueue.find((a) => a.name === `Advisor ${testId}`);
        if (!pending)
            throw new Error('Advisor not found in verification queue');
        console.log('[Phase 4] Approving Advisor:', pending.id);
        await axios.post(`${BASE_URL}/admin/verify`, {
            advisorProfileId: pending.id
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('✅ Advisor Approved');
        // 4. Login as Investor to see Advisor in Marketplace
        console.log('[Phase 4] Logging in as Investor to verify marketplace...');
        const invLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: investorEmail,
            password: 'password123'
        });
        const invToken = invLogin.data.token;
        const marketplace = await axios.get(`${BASE_URL}/matching/`, {
            headers: { Authorization: `Bearer ${invToken}` }
        });
        const advisorMatch = marketplace.data.find((m) => m.name === `Advisor ${testId}`);
        if (advisorMatch) {
            console.log('✅ Found Advisor in Marketplace. Match Score:', advisorMatch.matchScore, '%');
            console.log('--- PHASE 4 COMPLETED SUCCESSFULLY ---');
        }
        else {
            console.error('❌ Advisor not found in matching discovery. Current list:', marketplace.data.map((m) => m.name));
            process.exit(1);
        }
    }
    catch (error) {
        console.error('❌ PHASE 4 FAILED:', error.response?.data || error.message);
        process.exit(1);
    }
}
testPhase4();
