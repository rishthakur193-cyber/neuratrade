import axios from 'axios';
import { WebSocket } from 'ws';
import { randomUUID } from 'crypto';
const BASE_URL = 'http://localhost:5000/api';
const WS_URL = 'ws://localhost:5000';
async function testPhase6() {
    console.log('--- STARTING PHASE 6: REAL-TIME WEBSOCKET TEST ---');
    try {
        const testId = randomUUID().substring(0, 8);
        const advisorEmail = `adv-ws-${testId}@example.com`;
        const investorEmail = `inv-ws-${testId}@example.com`;
        // 1. Setup Advisor
        console.log('[Phase 6] Setting up Advisor...');
        await axios.post(`${BASE_URL}/auth/register`, {
            email: advisorEmail,
            name: `AdvWS ${testId}`,
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
        const pending = metrics.data.verificationQueue.find((a) => a.name === `AdvWS ${testId}`);
        await axios.post(`${BASE_URL}/admin/verify`, { advisorProfileId: pending.id }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        // 2. Setup Investor and WS Connection
        console.log('[Phase 6] Connecting Investor to WebSocket...');
        await axios.post(`${BASE_URL}/auth/register`, {
            email: investorEmail,
            name: `InvWS ${testId}`,
            password: 'password123',
            role: 'INVESTOR'
        });
        const invLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: investorEmail,
            password: 'password123'
        });
        const invToken = invLogin.data.token;
        const ws = new WebSocket(`${WS_URL}?token=${invToken}`);
        const signalReceived = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('WS Timeout: Signal not received')), 10000);
            ws.on('open', () => console.log('✅ WS Connected'));
            ws.on('message', (data) => {
                const msg = JSON.parse(data.toString());
                if (msg.type === 'NEW_SIGNAL') {
                    console.log('✅ Received NEW_SIGNAL via WebSocket:', msg.signal.symbol);
                    clearTimeout(timeout);
                    resolve(msg);
                }
            });
            ws.on('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });
        // 3. Publish Signal as Advisor
        console.log('[Phase 6] Publishing Signal as Advisor...');
        const advLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: advisorEmail,
            password: 'password123'
        });
        const advToken = advLogin.data.token;
        await axios.post(`${BASE_URL}/signal/publish`, {
            symbol: 'WS_TEST',
            entryPrice: 100,
            stopLoss: 90,
            target: 110,
            riskLevel: 'LOW',
            tradeReason: 'WebSocket Test',
            isDirectSignal: false,
            disclaimerAccepted: true
        }, { headers: { Authorization: `Bearer ${advToken}` } });
        // Wait for WS message
        await signalReceived;
        ws.close();
        console.log('--- PHASE 6 COMPLETED SUCCESSFULLY ---');
    }
    catch (error) {
        console.error('❌ PHASE 6 FAILED:', error.response?.data || error.message);
        process.exit(1);
    }
}
testPhase6();
