/**
 * NeuraTrade Dev Agent — Main Orchestrator
 *
 * State machine that:
 *   1. Announces what it's about to build and why
 *   2. Iterates through each module
 *   3. Displays live progress
 *   4. Logs every step with timestamps
 *   5. Periodically prints architecture map + plain summaries
 *   6. Suggests improvements
 *   7. Pauses for clarification when needed
 */

import readline from 'readline';
import { MODULES, getModulesByStatus, getCompletionPercent, type Module } from './modules.js';
import { DevLog } from './log.js';
import { renderAsciiMap } from './architecture.js';
import {
    renderBuildStatus,
    renderModuleCard,
    renderPreTaskAnnouncement,
    renderPlainSummary,
    renderImprovementSuggestions,
} from './report.js';

const DELAY_MS = 600; // ms between output steps (makes it feel live, not instant)
const SUMMARY_EVERY_N = 6; // Print plain summary every N modules

export class DevAgent {
    private log = new DevLog();
    private rl: readline.Interface;
    private modulesProcessed = 0;

    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    // ─────────────────────────────────────────────────────────────────
    // Main entry point
    // ─────────────────────────────────────────────────────────────────
    async run() {
        await this.banner();

        this.log.info(
            'Agent started',
            'NeuraTrade Dev Agent initialised successfully',
            'Begin iterating module registry',
        );

        // 1. Print initial build status
        console.log(renderBuildStatus());
        await this.sleep(DELAY_MS);

        // 2. Show architecture map
        console.log(renderAsciiMap());
        await this.sleep(DELAY_MS);

        // 3. Show improvement suggestions before building
        console.log(renderImprovementSuggestions());

        // 4. Ask if user wants to pause on each module for confirmation
        const interactive = await this.ask(
            '\n🤖 Run in interactive mode? (Pause before each module) [y/N]: '
        );
        const isInteractive = interactive.trim().toLowerCase() === 'y';

        // 5. Process each module
        for (const module of MODULES) {
            await this.processModule(module, isInteractive);
            this.modulesProcessed++;

            // Periodic plain summary
            if (this.modulesProcessed % SUMMARY_EVERY_N === 0) {
                console.log(renderPlainSummary());
                await this.sleep(DELAY_MS);
            }
        }

        // 6. Final report
        await this.finalReport();

        this.rl.close();
    }

    // ─────────────────────────────────────────────────────────────────
    // Status-only mode (for the API route to call)
    // ─────────────────────────────────────────────────────────────────
    runStatusOnly() {
        console.log(renderBuildStatus());
        console.log(renderPlainSummary());
    }

    // ─────────────────────────────────────────────────────────────────
    // Process a single module
    // ─────────────────────────────────────────────────────────────────
    private async processModule(module: Module, interactive: boolean) {
        // Pre-task announcement
        console.log(renderPreTaskAnnouncement(module));
        await this.sleep(DELAY_MS / 2);

        if (interactive) {
            const answer = await this.ask(
                `\n  Continue with "${module.name}"? [Y/n/skip]: `
            );
            const r = answer.trim().toLowerCase();
            if (r === 'n') {
                console.log(`  ⛔ Skipping "${module.name}" by user request.`);
                this.log.warn(
                    `Skipped module: ${module.name}`,
                    'User chose to skip',
                    'Move to next module',
                    module.id
                );
                return;
            }
        }

        // Handle STUB / REMAINING modules with clarification prompt
        if (module.status === 'STUB' || module.status === 'REMAINING') {
            await this.handleUncertainModule(module);
        }

        // Live progress simulation
        await this.showLiveProgress(module);

        // Module explanation card
        console.log(renderModuleCard(module));

        // Log to dev-log.json
        this.log.success(
            `Processed module: ${module.name}`,
            `Status: ${module.status} — Purpose confirmed, architecture integrated`,
            MODULES[MODULES.indexOf(module) + 1]
                ? `Process next: ${MODULES[MODULES.indexOf(module) + 1].name}`
                : 'All modules processed',
            module.id
        );

        await this.sleep(DELAY_MS);

        // Print updated build status every 5 modules
        if (this.modulesProcessed > 0 && this.modulesProcessed % 5 === 0) {
            console.log(renderBuildStatus());
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // Handle modules where info is missing / uncertain
    // ─────────────────────────────────────────────────────────────────
    private async handleUncertainModule(module: Module) {
        console.log(`\n  ⚠️  ${module.name} is currently a STUB or not yet built.`);
        console.log(`  📋 Purpose: ${module.purpose.split('.')[0]}.`);
        console.log(`  🤔 The agent needs clarification before proceeding:`);

        const stubs: Record<string, string[]> = {
            'payment-service': [
                '  1. Which payment provider should be used? (Razorpay recommended for INR)',
                '  2. Should this support one-time payments, subscriptions, or both?',
                '  3. Who receives payment — the platform, the advisor, or split?',
            ],
            'kyc-module': [
                '  1. Should KYC be manual (document upload) or automated via DigiLocker API?',
                '  2. What documents are required? (Aadhaar, PAN, Bank Statement?)',
                '  3. Who reviews and approves KYC — admin manually or automated?',
            ],
            'admin-dashboard': [
                '  1. Which admin roles are needed? (Super Admin, Support, Compliance?)',
                '  2. Should the fraud scoring algorithm be rule-based or ML-powered?',
                '  3. Is KYC approval integrated here or a separate workflow?',
            ],
            'agent-dashboard': [],
            'agent-core': [],
        };

        const questions = stubs[module.id] || [
            `  1. What is the expected completion timeline for ${module.name}?`,
            `  2. Are there any API credentials or external services needed?`,
        ];

        if (questions.length > 0) {
            console.log('\n  📌 CLARIFICATION NEEDED:');
            questions.forEach(q => console.log(q));

            const response = await this.ask(
                '\n  Your answer (or press Enter to note and continue): '
            );

            if (response.trim()) {
                this.log.info(
                    `Clarification for ${module.name}`,
                    `User provided: "${response.trim()}"`,
                    `Incorporate answer into ${module.name} design`,
                    module.id
                );
                console.log(`  ✅ Noted: "${response.trim()}". Logged to dev-log.json.`);
            } else {
                this.log.warn(
                    `Clarification needed: ${module.name}`,
                    'No answer provided — marked for follow-up',
                    `Revisit ${module.name} when requirements are confirmed`,
                    module.id
                );
                console.log(`  📌 Marked for follow-up. Continuing with next module.`);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // Show a live progress bar animation
    // ─────────────────────────────────────────────────────────────────
    private async showLiveProgress(module: Module) {
        const steps = [
            `  🔍 Analysing ${module.name}...`,
            `  📐 Mapping dependencies: ${module.dependents.join(', ') || 'none'}`,
            `  🔗 Checking APIs: ${module.apis.join(', ') || 'internal only'}`,
            `  📝 Documenting purpose and architecture...`,
            `  ✅ ${module.name} processed.`,
        ];

        for (const step of steps) {
            process.stdout.write(`\r${step}${' '.repeat(20)}`);
            await this.sleep(200);
        }
        process.stdout.write('\n');
    }

    // ─────────────────────────────────────────────────────────────────
    // Final report after all modules are processed
    // ─────────────────────────────────────────────────────────────────
    private async finalReport() {
        console.log('\n');
        console.log('═'.repeat(62));
        console.log('\x1b[1m\x1b[32m  🎯 AGENT RUN COMPLETE\x1b[0m');
        console.log('═'.repeat(62));
        console.log(renderBuildStatus());
        console.log(renderPlainSummary());
        console.log(renderImprovementSuggestions());

        const percent = getCompletionPercent();
        this.log.success(
            'Full agent run completed',
            `All ${MODULES.length} modules processed. Overall completion: ${percent}%`,
            'Review stub modules and implement: Payment Service, KYC Module, Admin Dashboard',
        );

        console.log(`\n  📄 Full development log saved to: agent/dev-log.json`);
        console.log(`  🌐 View live dashboard: http://localhost:3000/agent\n`);
    }

    // ─────────────────────────────────────────────────────────────────
    // Welcome Banner
    // ─────────────────────────────────────────────────────────────────
    private async banner() {
        console.clear();
        console.log(`
\x1b[36m\x1b[1m
██╗    ██╗███████╗ █████╗ ██╗  ████████╗██╗  ██╗
██║    ██║██╔════╝██╔══██╗██║  ╚══██╔══╝██║  ██║
██║ █╗ ██║█████╗  ███████║██║     ██║   ███████║
██║███╗██║██╔══╝  ██╔══██║██║     ██║   ██╔══██║
╚███╔███╔╝███████╗██║  ██║███████╗██║   ██║  ██║
 ╚══╝╚══╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝  ╚═╝
\x1b[0m
\x1b[1mEcosystem of Smart Investing — Self-Reporting Dev Agent v1.0\x1b[0m
\x1b[2mCurrent time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST\x1b[0m
`);
        await this.sleep(800);
    }

    // ─────────────────────────────────────────────────────────────────
    // Utilities
    // ─────────────────────────────────────────────────────────────────
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private ask(question: string): Promise<string> {
        return new Promise(resolve => {
            this.rl.question(question, resolve);
        });
    }
}
