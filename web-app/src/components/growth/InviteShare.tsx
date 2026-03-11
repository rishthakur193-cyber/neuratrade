'use client';

import React from 'react';
import {
    MessageCircle, // WhatsApp-like
    Twitter,
    Mail,
    Copy,
    Share2,
    CheckCircle2
} from 'lucide-react';
import { GlassCard, PremiumButton } from '@/components/ui/PremiumUI';
import { motion, AnimatePresence } from 'framer-motion';

export const InviteShare = ({ referralCode }: { referralCode: string }) => {
    const [copied, setCopied] = React.useState(false);
    const inviteLink = `${window.location.origin}/auth/register?ref=${referralCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOptions = [
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            color: '#25D366',
            url: `https://wa.me/?text=Join me on NeuraTrade - The elite nexus for smart investing. Use my referral code: ${referralCode} %0A ${inviteLink}`
        },
        {
            name: 'Twitter',
            icon: Twitter,
            color: '#1DA1F2',
            url: `https://twitter.com/intent/tweet?text=Join me on NeuraTrade - The elite nexus for smart investing. %0A ${inviteLink}`
        },
        {
            name: 'Email',
            icon: Mail,
            color: '#EA4335',
            url: `mailto:?subject=Join NeuraTrade&body=Join me on NeuraTrade - The elite nexus for smart investing. %0A ${inviteLink}`
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                {shareOptions.map((option) => (
                    <a
                        key={option.name}
                        href={option.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                    >
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `${option.color}20`, color: option.color }}
                        >
                            <option.icon size={22} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-white transition-colors">
                            {option.name}
                        </span>
                    </a>
                ))}
            </div>

            <div className="relative group">
                <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-6 pr-16 text-[10px] font-bold text-text-muted focus:border-accent-secondary outline-none transition-all"
                />
                <button
                    onClick={handleCopy}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-accent-secondary/10 text-accent-secondary hover:bg-accent-secondary hover:text-white transition-all"
                >
                    <AnimatePresence mode="wait">
                        {copied ? (
                            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <CheckCircle2 size={18} />
                            </motion.div>
                        ) : (
                            <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <Copy size={18} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </div>
    );
};
