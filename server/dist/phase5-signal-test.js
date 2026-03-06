import axios from 'axios';
import { randomUUID } from 'crypto';
const BASE_URL = 'http://localhost:5000/api';
async function testPhase5() {
    console.log('--- STARTING PHASE 5: SIGNAL ENGINE TEST ---');
    try {
        const testId = randomUUID().substring(0, 8);
        const advisorEmail = `advisor-sig-${testId}@example.com`;
        const investorEmail = `investor-sig-${testId}@example.com`;
        // 1. Register and Approve Advisor
        console.log('[Phase 5] Setting up Advisor...');
        await axios.post(`${BASE_URL}/auth/register`, {
            email: advisorEmail,
            name: `AdvSig ${testId}`,
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
        const pending = metrics.data.verificationQueue.find((a) => a.name === `AdvSig ${testId}`);
        await axios.post(`${BASE_URL}/admin/verify`, { advisorProfileId: pending.id }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Advisor Approved');
        // 2. Login as Advisor and Publish Signal
        console.log('[Phase 5] Publishing Signal as Advisor...');
        const advLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: advisorEmail,
            password: 'password123'
        });
        const advToken = advLogin.data.token;
        // Test Validation Logic (Target <= Entry)
        try {
            await axios.post(`${BASE_URL}/signal/publish`, {
                symbol: 'RELIANCE',
                entryPrice: 2500,
                stopLoss: 2400,
                target: 2450, // Invalid: Target below Entry for long
                isDirectSignal: false,
                disclaimerAccepted: true
            }, { headers: { Authorization: `Bearer ${advToken}` } });
            console.error('❌ Validation logic failed: Accepted invalid target');
            process.exit(1);
        }
        catch (e) {
            console.log('✅ Validation logic passed: Rejected invalid target');
        }
        // Publish Valid Signal
        const signalRes = await axios.post(`${BASE_URL}/signal/publish`, {
            symbol: 'RELIANCE',
            entryPrice: 2500,
            stopLoss: 2400,
            target: 2700,
            riskLevel: 'MEDIUM',
            tradeReason: 'Bullish breakout on daily chart',
            isDirectSignal: false,
            disclaimerAccepted: true
        }, { headers: { Authorization: `Bearer ${advToken}` } });
        console.log('✅ Signal Published:', signalRes.data.id);
        // 3. Register Investor and check feed
        console.log('[Phase 5] Verifying signal in Investor feed...');
        await axios.post(`${BASE_URL}/auth/register`, {
            email: investorEmail,
            name: `InvSig ${testId}`,
            password: 'password123',
            role: 'INVESTOR'
        });
        const invLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: investorEmail,
            password: 'password123'
        });
        const invToken = invLogin.data.token;
        const feedRes = await axios.get(`${BASE_URL}/signal/active`, {
            headers: { Authorization: `Bearer ${invToken}` }
        });
        const found = feedRes.data.find((s) => s.id === signalRes.data.id);
        if (found) {
            console.log('✅ Signal found in active feed');
            console.log('--- PHASE 5 COMPLETED SUCCESSFULLY ---');
        }
        else {
            console.error('❌ Signal not found in active feed');
            process.exit(1);
        }
    }
    catch (error) {
        console.error('❌ PHASE 5 FAILED:', error.response?.data || error.message);
        process.exit(1);
    }
}
testPhase5();
