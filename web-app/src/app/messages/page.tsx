"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Paperclip,
    Video,
    Phone,
    Search,
    MoreVertical,
    Calendar,
    FileText,
    Zap,
    CheckCheck,
    User,
    ShieldCheck,
    Activity,
    Lock,
    Mic,
    Image as ImageIcon,
    ChevronLeft,
    Sparkles,
    Star
} from "lucide-react";
import {
    GlassCard,
    PremiumButton,
    NeonBadge,
    SectionHighlight
} from "@/components/ui/PremiumUI";

const contacts = [
    { id: 1, name: "Dr. Arvinder Singh", role: "Elite Advisor", status: "online", lastMsg: "The Alpha Quant update is live.", time: "10:30 AM", unread: 2, match: 98 },
    { id: 2, name: "Sarah Fernandes", role: "Tax Specialist", status: "offline", lastMsg: "Please review the HNI report.", time: "Yesterday", unread: 0, match: 94 },
    { id: 3, name: "Vikram Malhotra", role: "Strategist", status: "online", lastMsg: "Meeting scheduled for 2 PM.", time: "Monday", unread: 0, match: 89 },
];

const messages = [
    { id: 1, text: "Hello Dr. Arvinder, I saw the new strategy update. Could you explain the risk exposure in midcaps?", sender: "me", time: "10:15 AM" },
    { id: 2, text: "Certainly! We've increased hedging specifically for the IT sector while staying aggressive on manufacturing. I've generated an AI summary for our last call which explains this.", sender: "them", time: "10:20 AM" },
    { id: 3, text: "That sounds proactive. When can we review the backtest?", sender: "me", time: "10:25 AM" },
    { id: 4, text: "The Alpha Quant update is live. You can see the projected returns on your dashboard now.", sender: "them", time: "10:30 AM" },
];

export default function CommunicationHub() {
    const [selectedContact, setSelectedContact] = useState(contacts[0]);
    const [inputText, setInputText] = useState("");

    return (
        <div className="h-screen bg-[#0B0B12] text-white flex overflow-hidden">
            {/* Sidebar - Network Threads */}
            <aside className="w-[400px] border-r border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col relative z-20">
                <div className="p-10 border-b border-white/5">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black tracking-tighter uppercase">Network</h2>
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-accent-secondary">
                            <Activity size={16} />
                        </div>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-secondary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find professionals or topics..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-xs outline-none focus:border-accent-secondary/50 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {contacts.map(contact => (
                        <div
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className={`p-6 flex items-center gap-4 cursor-pointer transition-all duration-300 relative group ${selectedContact.id === contact.id ? "bg-accent-secondary/5" : "hover:bg-white/5"
                                }`}
                        >
                            {selectedContact.id === contact.id && (
                                <motion.div layoutId="contact-active" className="absolute left-0 w-1 h-12 bg-accent-secondary shadow-neon-glow rounded-r-full" />
                            )}

                            <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:border-accent-secondary/30 transition-colors">
                                    <User className="text-text-muted" size={24} />
                                    <div className="absolute inset-0 bg-accent-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                {contact.status === 'online' && (
                                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-success rounded-full border-4 border-[#0B0B12]" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-black text-sm tracking-tight truncate">{contact.name}</h4>
                                    <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">{contact.time}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] text-accent-secondary font-black uppercase tracking-widest">{contact.role}</span>
                                    <span className="text-[9px] text-text-muted font-bold opacity-40">•</span>
                                    <span className="text-[10px] text-accent-cyan font-black">{contact.match}% MATCH</span>
                                </div>
                                <p className="text-xs text-text-secondary truncate font-medium">{contact.lastMsg}</p>
                            </div>

                            {contact.unread > 0 && (
                                <span className="w-5 h-5 rounded-full bg-accent-secondary text-[10px] font-black flex items-center justify-center shadow-neon-glow">
                                    {contact.unread}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="p-8 border-t border-white/5 bg-black/20">
                    <PremiumButton variant="secondary" className="w-full !py-3 text-[10px]">Invite Professional</PremiumButton>
                </div>
            </aside>

            {/* Main Chat Engine */}
            <main className="flex-1 flex flex-col relative bg-radial-highlights">
                {/* Chat Header */}
                <header className="px-12 py-8 backdrop-blur-xl bg-[#0B0B12]/60 border-b border-white/5 flex justify-between items-center z-10 sticky top-0">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-premium-gradient p-[1px] shadow-neon-glow">
                            <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
                                <User size={24} className="text-accent-secondary" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-xl tracking-tight">{selectedContact.name}</h3>
                                <ShieldCheck className="text-accent-cyan" size={18} />
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] text-accent-secondary font-black uppercase tracking-[0.2em]">{selectedContact.role}</p>
                                <div className={`w-1.5 h-1.5 rounded-full ${selectedContact.status === 'online' ? 'bg-success' : 'bg-text-muted'} shadow-[0_0_8px_currentColor]`} />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white transition-all"><Video size={20} /></button>
                        <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white transition-all"><Phone size={20} /></button>
                        <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white transition-all"><MoreVertical size={20} /></button>
                    </div>
                </header>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-12 space-y-10 flex flex-col custom-scrollbar pb-32">
                    <AnimatePresence>
                        {messages.map(msg => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`max-w-[65%] flex flex-col ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}
                            >
                                <div className={`p-5 rounded-[28px] text-[15px] leading-relaxed font-medium ${msg.sender === 'me'
                                    ? "bg-premium-gradient text-white rounded-tr-none shadow-neon-glow"
                                    : "bg-white/5 backdrop-blur-3xl border border-white/10 text-white rounded-tl-none shadow-xl"
                                    }`}>
                                    {msg.text}
                                </div>
                                <div className="flex items-center gap-2 mt-3 px-2">
                                    <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase">{msg.time}</span>
                                    {msg.sender === 'me' && <CheckCheck size={14} className="text-accent-cyan" />}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* AI Summary Intervention Card */}
                    <div className="self-center w-full max-w-2xl mt-8">
                        <GlassCard className="p-10 border-accent-secondary/30 relative overflow-hidden bg-accent-secondary/5" neon>
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Sparkles size={60} className="text-accent-secondary" />
                            </div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 rounded-lg bg-accent-secondary/20 text-accent-secondary">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-accent-secondary">AI CONTEXT MEMO</h4>
                                    <p className="text-[10px] text-text-muted font-bold uppercase">FEBRUARY 28th SESSION RECAP</p>
                                </div>
                            </div>
                            <p className="text-sm text-text-secondary leading-relaxed mb-8 font-medium italic">
                                "The call focused on **Institutional Risk Hegemony**. Dr. Arvinder proposed immediate rebalancing of the IT mandates while staying aggressive on direct manufacturing equities. Confidence in the NIFTY500 floor remains high."
                            </p>
                            <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-2">
                                    <FileText className="text-accent-secondary" size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Backtest_Report.v4</span>
                                </div>
                                <button className="text-[10px] font-black uppercase text-accent-secondary hover:underline">Download Audit</button>
                            </div>
                        </GlassCard>
                    </div>
                </div>

                {/* Secure Input Area */}
                <footer className="absolute bottom-0 inset-x-0 p-10 bg-gradient-to-t from-[#0B0B12] via-[#0B0B12]/95 to-transparent z-20">
                    <div className="max-w-5xl mx-auto flex items-center gap-6 relative group">
                        <div className="absolute inset-0 bg-accent-secondary/5 blur-[40px] opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />

                        <div className="flex gap-4">
                            <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:border-accent-secondary transition-all">
                                <Paperclip size={20} />
                            </button>
                        </div>

                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={`Securely message ${selectedContact.name}...`}
                                className="w-full bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl py-5 px-8 outline-none focus:border-accent-secondary/40 transition-all pr-32 font-medium text-sm"
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-6">
                                <Mic className="text-text-muted hover:text-accent-secondary cursor-pointer transition-colors" size={20} />
                                <ImageIcon className="text-text-muted hover:text-accent-secondary cursor-pointer transition-colors" size={20} />
                                <div className="w-px h-6 bg-white/10" />
                                <Calendar className="text-text-muted hover:text-accent-secondary cursor-pointer transition-colors" size={20} />
                            </div>
                        </div>

                        <button className="w-16 h-16 rounded-2xl bg-premium-gradient flex items-center justify-center text-white shadow-neon-glow hover:scale-105 active:scale-95 transition-all">
                            <Send size={24} />
                        </button>
                    </div>
                </footer>
            </main>

            {/* Right Sidebar - Entity Intelligence */}
            <aside className="w-[350px] border-l border-white/5 bg-black/40 backdrop-blur-3xl p-10 hidden 2xl:block space-y-10 relative z-20">
                <div className="text-center">
                    <div className="w-24 h-24 rounded-3xl bg-premium-gradient p-[1px] mx-auto mb-6 shadow-neon-glow">
                        <div className="w-full h-full rounded-3xl bg-black flex items-center justify-center text-accent-secondary">
                            <User size={48} />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight mb-2">{selectedContact.name}</h3>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.2em] mb-6">Partner Identity Verified</p>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(0,229,255,0.15)]">
                        <ShieldCheck size={14} /> SEBI REGISTERED
                    </div>
                </div>

                <GlassCard className="p-8 border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6">Shared Intelligence</h4>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] text-text-muted font-bold uppercase">Success Rate</p>
                            <p className="text-xl font-black text-success">98.2%</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] text-text-muted font-bold uppercase">AUM under Mandate</p>
                            <p className="text-xl font-black text-white">₹42.8 Cr</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] text-text-muted font-bold uppercase">Fiduciary Trust Score</p>
                            <div className="flex items-center gap-1 text-accent-secondary">
                                <Star size={14} fill="currentColor" />
                                <span className="text-xl font-black">4.9</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                        <Lock size={12} /> SECURE VAULT
                    </h4>
                    <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 hover:border-accent-secondary/30 cursor-pointer transition-all group">
                            <div className="p-2 rounded-lg bg-accent-secondary/10 text-accent-secondary group-hover:bg-accent-secondary group-hover:text-white transition-all">
                                <FileText size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-white truncate uppercase tracking-tight">Q4_Investment_Theses.pdf</p>
                                <p className="text-[9px] text-text-muted font-bold">2.4 MB • FEB 28</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 hover:border-accent-secondary/30 cursor-pointer transition-all group">
                            <div className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan group-hover:bg-accent-cyan group-hover:text-white transition-all">
                                <ShieldCheck size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-white truncate uppercase tracking-tight">KYC_Verified_Hash.json</p>
                                <p className="text-[9px] text-text-muted font-bold">4 KB • JAN 12</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
