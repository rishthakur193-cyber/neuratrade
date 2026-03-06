/**
 * Broker Interface — Broker Integration Layer
 *
 * Common contract that every broker connector must implement.
 * Adding a new broker = implement this interface + register in BrokerRegistry.
 *
 * ADDITIVE: This is a completely new folder. No existing files modified.
 */

export type BrokerName = 'ZERODHA' | 'ANGELONE' | 'UPSTOX';

export type BrokerStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'PENDING';

export interface BrokerCredentials {
    /** Broker-specific fields — each connector maps these however it needs */
    clientId?: string;
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    totp?: string;
    mpin?: string;
    requestToken?: string;
}

export interface BrokerSession {
    broker: BrokerName;
    status: BrokerStatus;
    accessToken: string;
    connectedAt: string;
    expiresAt?: string;
    message: string;
}

export interface BrokerHolding {
    symbol: string;
    exchange: 'NSE' | 'BSE' | 'NFO' | 'MCX';
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    pnl: number;
    pnlPct: number;
    isin?: string;
}

export interface BrokerPortfolio {
    broker: BrokerName;
    clientId: string;
    totalValue: number;
    totalPnl: number;
    totalPnlPct: number;
    holdings: BrokerHolding[];
    fetchedAt: string;
}

export interface VerifiedTrade {
    tradeId: string;
    symbol: string;
    exchange: string;
    transactionType: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    tradeDate: string;
    orderId: string;
    productType: string;
    brokerVerified: boolean;
}

export interface BrokerTradeHistory {
    broker: BrokerName;
    clientId: string;
    trades: VerifiedTrade[];
    totalTrades: number;
    winTrades: number;
    lossTrades: number;
    winRate: number;
    fetchedAt: string;
}

export interface AdvisorPerformanceVerification {
    advisorId: string;
    broker: BrokerName;
    verifiedTrades: number;
    winRate: number;
    avgReturn: number;
    maxDrawdown: number;
    verificationScore: number;  // 0–100
    isVerified: boolean;
    verifiedAt: string;
}

/** Every broker connector must implement this interface */
export interface IBrokerConnector {
    name: BrokerName;
    displayName: string;
    logoUrl: string;
    isConfigured: boolean;

    /** Authenticate and get session */
    connect(credentials: BrokerCredentials): Promise<BrokerSession>;

    /** Fetch investor portfolio */
    getPortfolio(accessToken: string, clientId: string): Promise<BrokerPortfolio>;

    /** Fetch trade history for advisor performance verification */
    getTradeHistory(accessToken: string, clientId: string, days?: number): Promise<BrokerTradeHistory>;

    /** Verify an advisor's performance from broker data */
    verifyAdvisorPerformance(advisorClientId: string, accessToken: string): Promise<AdvisorPerformanceVerification>;
}
