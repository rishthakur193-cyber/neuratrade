/**
 * NeuraTrade Dev Agent — Progress Reporter
 *
 * Generates:
 *   1. PROJECT BUILD STATUS block
 *   2. Module explanation cards
 *   3. Non-developer plain-language summaries
 *   4. Architectural improvement suggestions
 */

import {
    MODULES,
    getModulesByStatus,
    getCompletionPercent,
    type Module,
} from './modules.js';

// ─────────────────────────────────────────────────────────────────────────────
// ANSI colour helpers (works in most terminals; gracefully degrades)
// ─────────────────────────────────────────────────────────────────────────────
const C = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    magenta: '\x1b[35m',
    white: '\x1b[37m',
    bgBlue: '\x1b[44m',
    bgGreen: '\x1b[42m',
};

function colorFor(status: Module['status']): string {
    const map: Record<string, string> = {
        COMPLETE: C.green,
        IN_PROGRESS: C.yellow,
        REMAINING: C.cyan,
        STUB: C.red,
    };
    return map[status] ?? C.white;
}

function emojiFor(status: Module['status']): string {
    const map: Record<string, string> = {
        COMPLETE: '✅',
        IN_PROGRESS: '🔧',
        REMAINING: '⏳',
        STUB: '⚠️ ',
    };
    return map[status] ?? '•';
}

// ─────────────────────────────────────────────────────────────────────────────
// Progress Bar
// ─────────────────────────────────────────────────────────────────────────────
function renderProgressBar(percent: number, width = 40): string {
    const filled = Math.round((percent / 100) * width);
    const empty = width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `${C.green}${bar}${C.reset} ${C.bold}${percent}%${C.reset}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT BUILD STATUS
// ─────────────────────────────────────────────────────────────────────────────
export function renderBuildStatus(): string {
    const completed = getModulesByStatus('COMPLETE');
    const inProgress = getModulesByStatus('IN_PROGRESS');
    const stubs = getModulesByStatus('STUB');
    const remaining = getModulesByStatus('REMAINING');
    const percent = getCompletionPercent();

    const lines: string[] = [];
    lines.push('');
    lines.push(`${C.bold}${C.bgBlue}  PROJECT BUILD STATUS — ECOSYSTEM OF SMART INVESTING  ${C.reset}`);
    lines.push('═'.repeat(62));

    // Overall progress
    lines.push('');
    lines.push(`${C.bold}Overall Completion:${C.reset}`);
    lines.push(`  ${renderProgressBar(percent)}`);
    lines.push('');

    // Completed
    lines.push(`${C.green}${C.bold}✅ Modules Completed (${completed.length}):${C.reset}`);
    for (const m of completed) {
        lines.push(`   ${C.green}●${C.reset} ${m.name} ${C.dim}[${m.layer}]${C.reset}`);
    }

    // In Progress
    if (inProgress.length > 0) {
        lines.push('');
        lines.push(`${C.yellow}${C.bold}🔧 Modules In Progress (${inProgress.length}):${C.reset}`);
        for (const m of inProgress) {
            lines.push(`   ${C.yellow}●${C.reset} ${m.name} ${C.dim}[${m.layer}]${C.reset}`);
        }
    }

    // Stubs
    if (stubs.length > 0) {
        lines.push('');
        lines.push(`${C.red}${C.bold}⚠️  Stub Modules (${stubs.length}):${C.reset}`);
        for (const m of stubs) {
            lines.push(`   ${C.red}●${C.reset} ${m.name} — ${C.dim}${m.purpose.split('.')[0]}${C.reset}`);
        }
    }

    // Remaining
    if (remaining.length > 0) {
        lines.push('');
        lines.push(`${C.cyan}${C.bold}⏳ Modules Remaining (${remaining.length}):${C.reset}`);
        for (const m of remaining) {
            lines.push(`   ${C.cyan}●${C.reset} ${m.name} ${C.dim}[${m.layer}]${C.reset}`);
        }
    }

    lines.push('');
    lines.push('─'.repeat(62));
    return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Module Explanation Card
// ─────────────────────────────────────────────────────────────────────────────
export function renderModuleCard(module: Module): string {
    const col = colorFor(module.status);
    const emoji = emojiFor(module.status);
    const lines: string[] = [];

    lines.push('');
    lines.push(`${col}${C.bold}┌─ ${emoji} MODULE: ${module.name.toUpperCase()} ─${'─'.repeat(Math.max(0, 48 - module.name.length))}┐${C.reset}`);
    lines.push(`${col}│${C.reset} Status    : ${col}${C.bold}${module.status}${C.reset}`);
    lines.push(`${col}│${C.reset} Layer     : ${module.layer}`);
    lines.push(`${col}│${C.reset}`);
    lines.push(`${col}│${C.reset} ${C.bold}PURPOSE${C.reset}`);
    wrapText(module.purpose, 58).forEach(l => lines.push(`${col}│${C.reset}   ${l}`));
    lines.push(`${col}│${C.reset}`);
    lines.push(`${col}│${C.reset} ${C.bold}HOW IT WORKS${C.reset}`);
    wrapText(module.howItWorks, 58).forEach(l => lines.push(`${col}│${C.reset}   ${l}`));

    if (module.dependents.length > 0) {
        lines.push(`${col}│${C.reset}`);
        lines.push(`${col}│${C.reset} ${C.bold}DEPENDED ON BY${C.reset}`);
        lines.push(`${col}│${C.reset}   ${module.dependents.join(', ')}`);
    }

    if (module.apis.length > 0) {
        lines.push(`${col}│${C.reset}`);
        lines.push(`${col}│${C.reset} ${C.bold}APIS / DATA SOURCES${C.reset}`);
        module.apis.forEach(a => lines.push(`${col}│${C.reset}   • ${a}`));
    }

    lines.push(`${col}│${C.reset}`);
    lines.push(`${col}│${C.reset} ${C.dim}Files: ${module.filePaths.join(' | ')}${C.reset}`);
    lines.push(`${col}└${'─'.repeat(62)}┘${C.reset}`);
    return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Pre-task Announcement
// ─────────────────────────────────────────────────────────────────────────────
export function renderPreTaskAnnouncement(module: Module): string {
    const lines: string[] = [];
    lines.push('');
    lines.push(`${C.magenta}${C.bold}━━━ NEXT TASK ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
    lines.push(`${C.bold}Module:${C.reset} ${module.name}`);
    lines.push(`${C.bold}Why:${C.reset}   ${module.purpose.split('.')[0]}.`);
    lines.push(`${C.bold}How:${C.reset}   ${module.howItWorks.split('.')[0]}.`);
    if (module.apis.length > 0) {
        lines.push(`${C.bold}APIs:${C.reset}  ${module.apis.join(', ')}`);
    }
    lines.push(`${C.magenta}${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
    return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Non-developer Plain Language Summary
// ─────────────────────────────────────────────────────────────────────────────
export function renderPlainSummary(): string {
    const completed = getModulesByStatus('COMPLETE');
    const stubs = getModulesByStatus('STUB');
    const percent = getCompletionPercent();

    const lines: string[] = [];
    lines.push('');
    lines.push(`${C.bgGreen}${C.bold}  📰 PLAIN ENGLISH SUMMARY — FOR NON-DEVELOPERS  ${C.reset}`);
    lines.push('');
    lines.push(`${C.bold}What has been built:${C.reset}`);
    lines.push(`  NeuraTrade is a premium investing platform that connects`);
    lines.push(`  audited SEBI-registered financial advisors with investors.`);
    lines.push(`  Think of it as a "verified LinkedIn for money advisors"`);
    lines.push(`  combined with an institutional-grade investing dashboard.`);
    lines.push('');
    lines.push(`  ${C.green}${C.bold}${completed.length} major components are fully built:${C.reset}`);
    lines.push(`  • A secure login system with two-factor authentication`);
    lines.push(`  • A real-time portfolio tracker connected to a live broker`);
    lines.push(`  • An AI analyst that scores your portfolio risk (uses Google Gemini AI)`);
    lines.push(`  • An advisor-matching engine that ranks advisors by performance`);
    lines.push(`  • A 90-day certification journey for aspiring advisors`);
    lines.push(`  • A fraud detection system that blocks fake "investment gurus"`);
    lines.push(`  • A full audit trail for every security-sensitive action`);
    lines.push(`  • A hardened cloud backend running on Google Cloud`);
    lines.push('');
    lines.push(`${C.bold}What still needs work:${C.reset}`);
    for (const m of stubs) {
        lines.push(`  ⚠️  ${m.name} — ${m.purpose.split('.')[0]}`);
    }
    lines.push('');
    lines.push(`${C.bold}How it will work when finished:${C.reset}`);
    lines.push(`  1. An investor signs up, passes KYC, and links their broker account`);
    lines.push(`  2. The AI immediately analyses their portfolio for risk`);
    lines.push(`  3. The matching engine suggests the best-fit SEBI advisor`);
    lines.push(`  4. The advisor sees the investor's portfolio and provides advice`);
    lines.push(`  5. All interactions are permanently logged for compliance`);
    lines.push(`  6. Payments for advisory services are processed via Razorpay`);
    lines.push('');
    lines.push(`${C.bold}Overall progress: ${C.green}${percent}% complete${C.reset}`);
    lines.push('');
    return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Improvement Suggestions
// ─────────────────────────────────────────────────────────────────────────────
export const IMPROVEMENT_SUGGESTIONS = [
    {
        area: 'Payment Service',
        suggestion:
            'Consider integrating Razorpay Subscriptions (not one-time payments) so advisory fees are charged monthly automatically without manual renewals.',
        priority: 'HIGH',
    },
    {
        area: 'KYC Module',
        suggestion:
            'Add DigiLocker API integration for instant government-verified KYC instead of manual document uploads — faster onboarding, SEBI-compliant.',
        priority: 'HIGH',
    },
    {
        area: 'AI Risk Engine',
        suggestion:
            'Add sentiment analysis from NSE/BSE announcements using Gemini to give advisors real-time news-adjusted risk scores per holding.',
        priority: 'MEDIUM',
    },
    {
        area: 'Admin Dashboard',
        suggestion:
            'Build an automated fraud scoring pipeline: cross-reference SmartAPI P&L data with advisor-reported returns and flag anomalies automatically.',
        priority: 'HIGH',
    },
    {
        area: 'WebSocket Server',
        suggestion:
            'Implement Redis Pub/Sub between the Express WS server and the Next.js layer so multiple server instances can broadcast market data consistently in production.',
        priority: 'MEDIUM',
    },
    {
        area: 'Auth Service',
        suggestion:
            'Add magic-link email login as an alternative to password auth — reduces friction for investors who forget passwords and improves security.',
        priority: 'LOW',
    },
];

export function renderImprovementSuggestions(): string {
    const lines: string[] = [];
    lines.push('');
    lines.push(`${C.cyan}${C.bold}💡 ARCHITECTURAL IMPROVEMENT SUGGESTIONS${C.reset}`);
    lines.push('─'.repeat(62));
    for (const s of IMPROVEMENT_SUGGESTIONS) {
        const p = s.priority === 'HIGH' ? C.red : s.priority === 'MEDIUM' ? C.yellow : C.cyan;
        lines.push(`  ${p}[${s.priority}]${C.reset} ${C.bold}${s.area}${C.reset}`);
        wrapText(s.suggestion, 56).forEach(l => lines.push(`        ${l}`));
        lines.push('');
    }
    return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────
function wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
        if ((current + ' ' + word).trim().length > maxWidth) {
            if (current) lines.push(current);
            current = word;
        } else {
            current = (current + ' ' + word).trim();
        }
    }
    if (current) lines.push(current);
    return lines;
}
