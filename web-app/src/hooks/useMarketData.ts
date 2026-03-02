import { useState, useEffect, useRef } from 'react';

export function useMarketData(symbols: string[]) {
    const [data, setData] = useState<any[]>([]);
    const [connected, setConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:5000');
        ws.current = socket;

        socket.onopen = () => {
            console.log('✅ Connected to Market Stream');
            setConnected(true);
            socket.send(JSON.stringify({ type: 'SUBSCRIBE', symbols }));
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'MARKET_DATA') {
                    setData(message.updates);
                }
            } catch (err) {
                console.error('❌ WS Data Error:', err);
            }
        };

        socket.onclose = () => {
            console.log('ℹ️ Market Stream Disconnected');
            setConnected(false);
        };

        return () => {
            socket.close();
        };
    }, [symbols.join(',')]);

    return { data, connected };
}
