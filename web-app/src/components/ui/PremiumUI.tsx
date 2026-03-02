"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    neon?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = "",
    hoverEffect = true,
    neon = false,
    ...props
}) => {
    return (
        <motion.div
            whileHover={hoverEffect ? { y: -5, transition: { duration: 0.2 } } : {}}
            className={`glass-panel ${neon ? 'glass-card-neon' : ''} ${className}`}
            {...(props as any)}
        >
            {children}
        </motion.div>
    );
};

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    icon?: React.ElementType;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
    children,
    variant = 'primary',
    className = "",
    icon: Icon,
    ...props
}) => {
    const baseClass = variant === 'primary' ? 'btn-premium-primary' : 'btn-premium-secondary';

    return (
        <button
            className={`${baseClass} flex items-center justify-center gap-2 group transition-all duration-300 ${className}`}
            {...props}
        >
            {children}
            {Icon && <Icon size={18} className="group-hover:translate-x-1 transition-transform" />}
        </button>
    );
};

interface NeonBadgeProps {
    text?: string;
    children?: React.ReactNode;
    icon?: React.ElementType;
    color?: 'purple' | 'cyan' | 'success' | 'danger' | 'warning' | 'accent-primary';
    className?: string;
}

export const NeonBadge: React.FC<NeonBadgeProps> = ({
    text,
    children,
    icon: Icon,
    color = 'purple',
    className = ""
}) => {
    const colorClasses = {
        purple: 'bg-accent-secondary/10 border-accent-secondary/30 text-accent-secondary shadow-neon-glow',
        cyan: 'bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan shadow-neon-glow-cyan',
        success: 'bg-success/10 border-success/30 text-success shadow-neon-glow-success',
        danger: 'bg-danger/10 border-danger/30 text-danger shadow-neon-glow-danger',
        warning: 'bg-warning/10 border-warning/30 text-warning shadow-neon-glow-warning',
        'accent-primary': 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary shadow-neon-glow',
    };

    return (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border flex items-center gap-2 w-fit ${colorClasses[color] || colorClasses.purple} ${className}`}>
            {Icon && <Icon size={14} />}
            {children || text}
        </span>
    );
};

interface SectionHighlightProps {
    className?: string;
    color?: 'purple' | 'cyan' | 'blue';
}

export const SectionHighlight: React.FC<SectionHighlightProps> = ({
    className = "",
    color = "purple"
}) => {
    const colorMap = {
        purple: 'bg-accent-secondary/15',
        cyan: 'bg-accent-cyan/15',
        blue: 'bg-blue-500/15'
    };

    return (
        <motion.div
            animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.1, 1],
            }}
            transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className={`absolute w-[800px] h-[800px] ${colorMap[color]} rounded-full blur-[160px] pointer-events-none -z-10 ${className}`}
        />
    );
};
