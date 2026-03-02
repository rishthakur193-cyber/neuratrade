"use client";

import React from "react";
import { motion } from "framer-motion";

const nodes = [
    { id: "me", label: "Investor", x: 250, y: 200, type: "main", color: "#8b5cf6" },
    { id: "a1", label: "Equity Advisor", x: 100, y: 100, type: "advisor", color: "#a855f7" },
    { id: "a2", label: "Debt specialist", x: 400, y: 100, type: "advisor", color: "#a855f7" },
    { id: "a3", label: "AI Fraud Radar", x: 250, y: 50, type: "security", color: "#10b981" },
    { id: "s1", label: "Large Cap Fund", x: 50, y: 250, type: "strategy", color: "#6366f1" },
    { id: "s2", label: "Index Alpha", x: 150, y: 300, type: "strategy", color: "#6366f1" },
    { id: "s3", label: "Government Bonds", x: 450, y: 250, type: "strategy", color: "#6366f1" },
];

const connections = [
    { from: "me", to: "a1" },
    { from: "me", to: "a2" },
    { from: "me", to: "a3" },
    { from: "a1", to: "s1" },
    { from: "a1", to: "s2" },
    { from: "a2", to: "s3" },
    { from: "a3", to: "a1" },
    { from: "a3", to: "a2" },
];

export default function EcosystemMap() {
    return (
        <div className="w-full h-full relative overflow-hidden bg-background-tertiary/20 rounded-2xl flex items-center justify-center">
            <svg width="500" height="350" viewBox="0 0 500 350" className="drop-shadow-2xl">
                {/* Connection Lines */}
                {connections.map((conn, i) => {
                    const fromNode = nodes.find((n) => n.id === conn.from)!;
                    const toNode = nodes.find((n) => n.id === conn.to)!;
                    return (
                        <motion.line
                            key={i}
                            x1={fromNode.x}
                            y1={fromNode.y}
                            x2={toNode.x}
                            y2={toNode.y}
                            stroke="currentColor"
                            className="text-white/10"
                            strokeWidth="1.5"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                        />
                    );
                })}

                {/* Nodes */}
                {nodes.map((node) => (
                    <g key={node.id}>
                        {/* Glow Effect */}
                        <circle
                            cx={node.x}
                            cy={node.y}
                            r={node.type === "main" ? 15 : 10}
                            fill={node.color}
                            className="opacity-20 blur-[8px]"
                        />
                        {/* Core Node */}
                        <motion.circle
                            cx={node.x}
                            cy={node.y}
                            r={node.type === "main" ? 10 : 7}
                            fill={node.color}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.3 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="cursor-pointer"
                        />
                        {/* Label */}
                        <text
                            x={node.x}
                            y={node.y + (node.type === "main" ? 25 : 20)}
                            textAnchor="middle"
                            className="fill-text-secondary text-[10px] font-bold tracking-tight uppercase"
                        >
                            {node.label}
                        </text>
                    </g>
                ))}
            </svg>

            {/* Background Pulse Rings */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border border-accent-primary/5 rounded-full animate-ping pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-accent-primary/2 rounded-full pointer-events-none" />
            </div>
        </div>
    );
}
