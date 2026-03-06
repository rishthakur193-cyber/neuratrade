import { AngelOneProvider } from './brokers/AngelOneProvider.js';
import { ZerodhaProvider } from './brokers/ZerodhaProvider.js';
import { DhanProvider } from './brokers/DhanProvider.js';
export class BrokerService {
    static providers = new Map();
    static registerProvider(provider) {
        this.providers.set(provider.name.toLowerCase(), provider);
    }
    static initialize() {
        this.registerProvider(new AngelOneProvider());
        this.registerProvider(new ZerodhaProvider());
        this.registerProvider(new DhanProvider());
        console.log('BrokerService initialized with providers: AngelOne, Zerodha, Dhan');
    }
    static isLiveExecutionEnabled = process.env.LIVE_EXECUTION_ENABLED === 'true';
    static getProvider(name) {
        return this.providers.get(name.toLowerCase());
    }
    static async executeSignal(brokerName, signal) {
        if (!this.isLiveExecutionEnabled) {
            console.log(`[BrokerService] [DRY-RUN] Suppressing order for ${signal.symbol} on ${brokerName}`);
            return {
                status: 'SUCCESS_DRY_RUN',
                orderId: 'DRY-' + Date.now(),
                message: 'Simulation successful: No live trade executed.'
            };
        }
        const provider = this.getProvider(brokerName);
        if (!provider)
            throw new Error(`Broker ${brokerName} not found`);
        return await provider.placeOrder({
            symbol: signal.symbol,
            quantity: 1, // Default or calculated qty
            price: signal.entryPrice,
            type: 'LIMIT',
            transactionType: 'BUY'
        });
    }
}
