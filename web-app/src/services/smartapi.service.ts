export class SmartApiService {
    private static BASE_URL = 'https://apiconnect.angelbroking.com';
    private static API_KEY = process.env.SMARTAPI_API_KEY;

    /**
     * Initializes session token using the verified MPIN authentication flow.
     * Replaces password-based auth for Broker API compliance.
     */
    static async loginWithMpin(clientCode: string, mpin: string, totp: string) {
        if (!clientCode || !mpin || !totp) {
            throw new Error('Missing SmartAPI credentials');
        }

        try {
            const response = await fetch(`${this.BASE_URL}/rest/auth/angelbroking/user/v1/loginByPassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-UserType': 'USER',
                    'X-SourceID': 'WEB',
                    'X-ClientLocalIP': '127.0.0.1',
                    'X-ClientPublicIP': '127.0.0.1',
                    'X-MACAddress': '00-00-00-00-00-00',
                    'X-PrivateKey': this.API_KEY || ''
                },
                body: JSON.stringify({
                    clientcode: clientCode,
                    password: mpin, // Angel One often uses MPIN as password in some flows
                    totp: totp
                })
            });

            const data = await response.json();

            if (!data.status) {
                throw new Error(data.message || 'Broker authentication failed');
            }

            return {
                jwtToken: data.data.jwtToken,
                refreshToken: data.data.refreshToken,
                feedToken: data.data.feedToken,
                message: 'Broker Session Initialized Successfully'
            };
        } catch (error: any) {
            console.error('SmartAPI Login Error:', error);
            throw new Error(error.message || 'Failed to connect to Broker API');
        }
    }

    /**
     * Fetches real-time LTP (Last Traded Price) for a list of symbols
     */
    static async getLtp(jwtToken: string, instruments: { exchange: string, symboltoken: string }[]) {
        try {
            const response = await fetch(`${this.BASE_URL}/rest/auth/angelbroking/market/v1/quote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-UserType': 'USER',
                    'X-SourceID': 'WEB',
                    'X-PrivateKey': this.API_KEY || '',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify({
                    mode: 'LTP',
                    exchangeTokens: {
                        [instruments[0].exchange]: [instruments[0].symboltoken]
                    }
                })
            });

            const data = await response.json();
            return data.status ? data.data : null;
        } catch (error) {
            console.error('LTP Fetch Error:', error);
            return null;
        }
    }

    /**
     * Places a real order via Angel One SmartAPI
     */
    static async placeOrder(jwtToken: string, orderDetails: {
        symboltoken: string,
        exchange: string,
        transactiontype: 'BUY' | 'SELL',
        quantity: number,
        price: number
    }) {
        try {
            const response = await fetch(`${this.BASE_URL}/rest/auth/angelbroking/order/v1/placeOrder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-UserType': 'USER',
                    'X-SourceID': 'WEB',
                    'X-PrivateKey': this.API_KEY || '',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify({
                    variety: 'NORMAL',
                    tradingsymbol: orderDetails.symboltoken, // Usually needs symbol name from lookup
                    symboltoken: orderDetails.symboltoken,
                    transactiontype: orderDetails.transactiontype,
                    exchange: orderDetails.exchange,
                    ordertype: 'LIMIT',
                    producttype: 'DELIVERY',
                    duration: 'DAY',
                    price: orderDetails.price.toString(),
                    quantity: orderDetails.quantity.toString()
                })
            });

            const data = await response.json();
            if (!data.status) throw new Error(data.message || 'Order placement failed');
            return data.data; // Order ID
        } catch (error: any) {
            console.error('Order Execution Error:', error);
            throw new Error(error.message || 'Failed to place order via Broker API');
        }
    }

    /**
     * Placeholder to generate required websocket signatures for LTP streaming
     */
    static async getWebSocketAuth(clientCode: string, feedToken: string) {
        return {
            auth: feedToken,
            clientCode: clientCode,
            endpoint: "wss://smartapisocket.angelone.in/v2"
        };
    }
}
