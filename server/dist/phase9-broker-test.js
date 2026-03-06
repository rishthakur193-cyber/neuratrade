import { BrokerService } from './services/BrokerService.js';
import { AngelOneProvider } from './services/brokers/AngelOneProvider.js';
import { DhanProvider } from './services/brokers/DhanProvider.js';
import { ZerodhaProvider } from './services/brokers/ZerodhaProvider.js';
async function runBrokerTest() {
    console.log('--- PHASE 9: BROKER SIMULATION TEST ---');
    console.log('\n[1] Initializing Broker Service (Dry-Run Mode)...');
    BrokerService.initialize();
    const signal = {
        symbol: 'RELIANCE',
        entryPrice: 2800,
        stopLoss: 2750,
        target: 2900,
        riskLevel: 'MEDIUM'
    };
    console.log('\n[2] Testing Simulated Execution on AngelOne...');
    try {
        const angelRes = await BrokerService.executeSignal('AngelOne', signal);
        console.log('✅ AngelOne Response:', angelRes);
    }
    catch (e) {
        console.error('❌ AngelOne Error:', e.message);
    }
    console.log('\n[3] Testing Simulated Execution on Dhan...');
    try {
        const dhanRes = await BrokerService.executeSignal('Dhan', signal);
        console.log('✅ Dhan Response:', dhanRes);
    }
    catch (e) {
        console.error('❌ Dhan Error:', e.message);
    }
    console.log('\n[4] Testing Simulated Execution on Zerodha...');
    try {
        const zerodhaRes = await BrokerService.executeSignal('Zerodha', signal);
        console.log('✅ Zerodha Response:', zerodhaRes);
    }
    catch (e) {
        console.error('❌ Zerodha Error:', e.message);
    }
    // Quick test if we actually try to run a real one directly via Provider Methods to see mock behavior (optional)
    console.log('\n[5] Testing Provider Mock Behavior Directly (Optional)...');
    const angelProv = new AngelOneProvider();
    try {
        const res = await angelProv.placeOrder({
            symbol: 'TCS', quantity: 10, type: 'MARKET', transactionType: 'BUY'
        });
        console.log('✅ AngelOne Direct Provider Mock Response:', res);
    }
    catch (e) {
        console.log('❌ Direct Provider Test failed (Expected if not configured):', e.message);
    }
    console.log('\nTest Complete.');
}
runBrokerTest().catch(console.error);
