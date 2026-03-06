/**
 * NeuraTrade Dev Agent — CLI Entry Point
 *
 * Usage:
 *   npx ts-node run.ts              → Full interactive run
 *   npx ts-node run.ts --status     → Print status only and exit
 *   npx ts-node run.ts --log        → Print last 20 log entries and exit
 */

import { DevAgent } from './agent';
import { DevLog } from './log';

const args = process.argv.slice(2);

async function main() {
    // --status flag: just print the current build status and exit
    if (args.includes('--status') || args.includes('--status-only')) {
        const agent = new DevAgent();
        agent.runStatusOnly();
        process.exit(0);
    }

    // --log flag: print recent dev log entries and exit
    if (args.includes('--log')) {
        const log = new DevLog();
        const entries = log.getRecent(20);
        if (entries.length === 0) {
            console.log('No log entries yet. Run the agent first.');
        } else {
            console.log('\n📋 Recent Development Log (last 20 entries):\n');
            entries.forEach(e => console.log(DevLog.format(e) + '\n'));
        }
        process.exit(0);
    }

    // Default: full interactive run
    const agent = new DevAgent();
    try {
        await agent.run();
    } catch (err: any) {
        console.error('\n❌ Agent encountered an unexpected error:', err?.message || err);
        process.exit(1);
    }
}

main();
