import type { BrokerProvider, OrderParams } from '../BrokerService.js';
import axios from 'axios';

export class DhanProvider implements BrokerProvider {
    name = 'Dhan';
    private baseUrl = 'https://api.dhan.co';
    private clientId: string;
    private accessToken: string;

    constructor() {
        this.clientId = process.env.DHAN_CLIENT_ID || '';
        this.accessToken = process.env.DHAN_ACCESS_TOKEN || '';
    }

    async authenticate(): Promise<boolean> {
        return true; // Dhan uses permanent access tokens
    }

    async placeOrder(params: OrderParams): Promise<any> {
        try {
            const response = await axios.post(`${this.baseUrl}/orders`, {
                dhanClientId: this.clientId,
                correlationId: 'neuratrade-' + Date.now(),
                transactionType: params.transactionType,
                exchangeSegment: 'NSE_EQ',
                productType: 'DELIVERY',
                orderType: params.type,
                validity: 'DAY',
                tradingSymbol: params.symbol,
                securityId: 'mock_id',
                quantity: params.quantity,
                price: params.price
            }, {
                headers: {
                    'access-token': this.accessToken,
                    'Content-Type': 'application/json'
                }
            });

            return response.data;
        } catch (error: any) {
            console.error('Dhan Order Error:', error.response?.data || error.message);
            throw error;
        }
    }

    async getPositions(): Promise<any[]> {
        return [];
    }

    async getQuotes(symbol: string): Promise<any> {
        return { ltp: 0 };
    }
}
