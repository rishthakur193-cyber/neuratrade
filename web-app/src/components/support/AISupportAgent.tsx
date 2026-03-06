"use client";

import React, { useState } from 'react';

/**
 * AI Support Agent Component
 * 
 * Persistent chat widget for instant user guidance.
 */

export default function AISupportAgent() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
        { role: 'ai', text: "Hello! I'm your Smart Investing AI assistant. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endOfMessagesRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;
        const newMsg = { role: 'user' as const, text };
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/support/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: "System Error: Unable to reach intelligence core." }]);
            }
        } catch (e) {
            setMessages(prev => [...prev, { role: 'ai', text: "Network Error: Uplink failed." }]);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Bubble Icon */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-xl hover:bg-blue-500 transition-all hover:scale-110 active:scale-95"
                >
                    <span className="text-2xl">🤖</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 h-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    <header className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="font-semibold text-white">Platform Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                    </header>

                    <div className="flex-1 p-4 space-y-4 overflow-y-auto text-sm custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`p-3 max-w-[85%] leading-relaxed shadow-md ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl'
                                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tr-xl rounded-br-xl rounded-bl-xl'
                                    }`} dangerouslySetInnerHTML={{ __html: msg.text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="text-blue-400 underline font-bold">$1</a>') }} />
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-slate-400 flex gap-1">
                                    <span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span>
                                </div>
                            </div>
                        )}
                        <div ref={endOfMessagesRef} />

                        {messages.length === 1 && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800/50">
                                <QuickAction label="How to subscribe?" onClick={() => handleSend("How to subscribe?")} />
                                <QuickAction label="Verify an advisor" onClick={() => handleSend("Verify an advisor")} />
                                <QuickAction label="Report an issue" onClick={() => handleSend("Report an issue")} />
                            </div>
                        )}
                    </div>

                    <footer className="p-3 border-t border-slate-700 bg-slate-900">
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            />
                            <button type="submit" disabled={!input.trim() || loading} className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                                Send
                            </button>
                        </form>
                    </footer>
                </div>
            )}
        </div>
    );
}

function QuickAction({ label, onClick }: { label: string, onClick?: () => void }) {
    return (
        <button onClick={onClick} className="text-[10px] font-bold py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-slate-300 transition-colors uppercase tracking-widest whitespace-nowrap">
            {label}
        </button>
    );
}
