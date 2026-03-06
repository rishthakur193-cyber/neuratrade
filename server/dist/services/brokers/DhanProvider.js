import axios from 'axios';
export class DhanProvider {
    name = 'Dhan';
    baseUrl = 'https://api.dhan.co';
    clientId;
    accessToken;
    constructor() {
        this.clientId = process.env.DHAN_CLIENT_ID || '';
        this.accessToken = process.env.DHAN_ACCESS_TOKEN || '';
    }
    async authenticate() {
        return true; // Dhan uses permanent access tokens
    }
    async placeOrder(params) {
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
        }
        catch (error) {
            console.error('Dhan Order Error:', error.response?.data || error.message);
            throw error;
        }
    }
    async getPositions() {
        return [];
    }
    async getQuotes(symbol) {
        return { ltp: 0 };
    }
}
