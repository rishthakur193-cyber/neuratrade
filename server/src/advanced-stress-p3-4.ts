import prisma from './lib/prisma.js';
import { SignalService } from './services/SignalService.js';
import WebSocket from 'ws';
import jwt from 'jsonwebtoken';

async function runPhase3And4() {
    console.log('--- ADVANCED STRESS TEST: PHASE 3 & 4 ---');

    console.log('\n[1] Setup: Fetching 10 Advisors...');
    const advisors = await prisma.advisorProfile.findMany({
        where: { isVerified: true },
        take: 10
    });

    if (advisors.length < 10) {
        throw new Error('Need at least 10 verified advisors. Please run Phase 1 first.');
    }

    console.log(`✅ Found ${advisors.length} Verified Advisors.`);

    // === PHASE 4: WEBSOCKET REALTIME TEST SETUP ===
    console.log('\n[PHASE 4] Setting up simulated WebSocket client...');
    let wsConnected = false;
    let wsMessagesReceived = 0;
    let newSignalsReceived = 0;

    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev-only';
    const token = jwt.sign({ userId: advisors[0].userId, role: 'ADVISOR' }, JWT_SECRET);
    const ws = new WebSocket(`ws://localhost:5000?token=${token}`);

    ws.on('open', () => {
        wsConnected = true;
        console.log('🔗 WebSocket Connected successfully.');
    });

    ws.on('message', (data) => {
        wsMessagesReceived++;
        try {
            const parsed = JSON.parse(data.toString());
            // NEW_SIGNAL or FEED_EVENT are broadcasted on signal publish
            if (parsed.type === 'NEW_SIGNAL' || parsed.type === 'FEED_EVENT') {
                newSignalsReceived++;
            }
        } catch (e) { }
    });

    ws.on('error', (err) => {
        console.error('❌ WebSocket Error:', err.message);
    });

    ws.on('close', () => {
        console.log('🔌 WebSocket disconnected.');
    });

    // Wait a brief moment for WS to connect
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (!wsConnected) {
        console.warn('⚠️ WebSocket did not connect within 1s. Ensure the development server is running on port 5000.');
    }

    // Capture initial signal count
    const initialSignalCount = await prisma.advisorRecommendation.count();

    // === PHASE 3: SIGNAL GENERATION LOAD TEST ===
    console.log('\n[PHASE 3] Simulating Advisor Activity via HTTP API (10 Advisors x 20 Signals = 200 Signals)...');

    const publishPromises = [];
    const startTime = performance.now();

    for (const advisor of advisors) {
        const advToken = jwt.sign({ userId: advisor.userId, role: 'ADVISOR' }, JWT_SECRET);

        for (let i = 0; i < 20; i++) {
            const ePrice = 1000 + i * 10;

            publishPromises.push(
                fetch('http://localhost:5000/api/signal', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${advToken}`
                    },
                    body: JSON.stringify({
                        symbol: `LOADTST${advisor.id.substring(0, 4)}${i}`,
                        entryPrice: ePrice,
                        target: ePrice * 1.05,
                        stopLoss: ePrice * 0.95,
                        riskLevel: i % 2 === 0 ? 'HIGH' : 'MEDIUM',
                        tradeReason: 'Automated Stress Test Publish',
                        isDirectSignal: false,
                        disclaimerAccepted: true
                    })
                }).then(res => res.json())
            );
        }
    }

    try {
        await Promise.all(publishPromises);
    } catch (e: any) {
        console.error('❌ HTTP Signal Publishing Error:', e.message);
    }

    const duration = performance.now() - startTime;
    console.log(`✅ 200 Signals generated via HTTP in ${duration.toFixed(2)}ms.`);

    const postSignalCount = await prisma.advisorRecommendation.count();
    const insertedCount = postSignalCount - initialSignalCount;

    if (insertedCount === 200) {
        console.log(`✅ Database insertion stable. Exact 200 inserted.`);
    } else {
        console.error(`❌ DB Insertion Mismatch. Expected 200, got ${insertedCount}`);
    }

    // === PHASE 4: WEBSOCKET VERIFICATION ===
    console.log('\n[PHASE 4] Verifying Realtime Feed Broadcast Stability...');

    // Give WebSocket loop a moment to drain incoming messages
    await new Promise(resolve => setTimeout(resolve, 2000));

    // A single publish triggers both NEW_SIGNAL and FEED_EVENT in some flows, or just one.
    // Let's at least expect 200+ event triggers on WS
    console.log(`📡 Total WS Messages Received: ${wsMessagesReceived}`);
    console.log(`📡 Signal/Feed Specific Events Received: ${newSignalsReceived}`);

    if (newSignalsReceived >= 200) {
        console.log(`✅ WebSocket delivery confirmed for all signals! Stability maintained.`);
    } else if (newSignalsReceived > 0) {
        console.warn(`⚠️ Partial WebSocket delivery: Received ${newSignalsReceived}/200+ events. Could be throttling or connection dropped.`);
    } else {
        console.error(`❌ WebSocket feed failed. Received 0 feed events.`);
    }

    ws.close();

    console.log('\nTest Complete.');
    await prisma.$disconnect();
}

runPhase3And4().catch(e => {
    console.error(e);
    prisma.$disconnect();
});
