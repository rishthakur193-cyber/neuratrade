import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export function setupWebSockets(server: Server) {
    const wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    });

    wss.on('connection', (ws: WebSocket) => {
        console.log('✅ Client connected to market data stream');

        ws.on('message', (message: string) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'SUBSCRIBE') {
                    console.log(`📡 Subscribing to: ${data.symbols.join(', ')}`);
                    startBrokerStream(ws, data.symbols);
                }
            } catch (err) {
                console.error('❌ WS Message Error:', err);
            }
        });

        ws.on('close', () => {
            console.log('ℹ️ Client disconnected');
        });
    });

    return wss;
}

function startBrokerStream(clientWs: WebSocket, symbols: string[]) {
    // This is where real SmartAPI WebSocket integration would live.
    // We send periodic updates to the client.
    const interval = setInterval(() => {
        if (clientWs.readyState !== WebSocket.OPEN) {
            clearInterval(interval);
            return;
        }

        const updates = symbols.map(s => ({
            symbol: s,
            ltp: (Math.random() * 100 + 1500).toFixed(2),
            change: (Math.random() * 10 - 5).toFixed(2),
            changePercent: (Math.random() * 2 - 1).toFixed(2),
            timestamp: new Date().toISOString()
        }));

        clientWs.send(JSON.stringify({ type: 'MARKET_DATA', updates }));
    }, 1000);
}
