"use client";

import React from "react";
import { ShieldAlert, Info } from "lucide-react";
import { GlassCard } from "@/components/ui/PremiumUI";

interface DisclaimerProps {
    type: "risk" | "platform" | "performance";
    className?: string;
}

const DISCLAIMERS = {
    risk: {
        title: "MANDATORY RISK DISCLOSURE",
        content: "Investment in securities markets involves risk. You should carefully consider whether such investment is suitable for you in light of your financial condition.",
        icon: ShieldAlert,
        color: "text-danger",
        bg: "bg-danger/10",
        border: "border-danger/20"
    },
    platform: {
        title: "NEURATRADE TECHNOLOGY PLATFORM DISCLAIMER",
        content: "NeuraTrade is a technology platform connecting investors with advisors. The platform does not provide investment advice, nor does it recommend any specific advisor or strategy.",
        icon: Info,
        color: "text-accent-secondary",
        bg: "bg-accent-secondary/10",
        border: "border-accent-secondary/20"
    },
    performance: {
        title: "PERFORMANCE DISCLAIMER",
        content: "Past performance does not guarantee future results. Returns exhibited are simulated or based on historical signals and do not represent actual portfolio performance.",
        icon: Info,
        color: "text-accent-cyan",
        bg: "bg-accent-cyan/10",
        border: "border-accent-cyan/20"
    }
};

export const RegulatoryDisclaimer = ({ type, className = "" }: DisclaimerProps) => {
    const config = DISCLAIMERS[type];
    const Icon = config.icon;

    return (
        <div className={`p-4 rounded-2xl ${config.bg} border ${config.border} flex gap-4 ${className}`}>
            <Icon className={`${config.color} shrink-0`} size={20} />
            <div className="space-y-1">
                <h4 className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>
                    {config.title}
                </h4>
                <p className="text-[11px] text-white/70 font-medium italic leading-relaxed">
                    {config.content}
                </p>
            </div>
        </div>
    );
};
