import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev-only';
let broadcastToAll = null;
export const getBroadcastToAll = () => broadcastToAll;
export function setupWebSockets(server) {
    const wss = new WebSocketServer({ noServer: true });
    broadcastToAll = (data) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    };
    server.on('upgrade', (request, socket, head) => {
        const url = new URL(request.url || '', `http://${request.headers.host}`);
        const token = url.searchParams.get('token');
        if (!token) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }
        try {
            jwt.verify(token, JWT_SECRET);
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        }
        catch (err) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
        }
    });
    wss.on('connection', (ws) => {
        console.log('✅ Client connected to market data stream');
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'SUBSCRIBE') {
                    console.log(`📡 Subscribing to: ${data.symbols.join(', ')}`);
                    startBrokerStream(ws, data.symbols);
                }
            }
            catch (err) {
                console.error('❌ WS Message Error:', err);
            }
        });
        ws.on('close', () => {
            console.log('ℹ️ Client disconnected');
        });
    });
    return {
        wss,
        broadcastToAll: (data) => {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        }
    };
}
function startBrokerStream(clientWs, symbols) {
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
