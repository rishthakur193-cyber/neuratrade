/**
 * NeuraTrade Dev Agent — Development Log
 *
 * Maintains a persistent timestamped log of every action the agent takes.
 * Written to agent/dev-log.json on disk, readable by the /api/agent/status route.
 */

import fs from 'fs';
import path from 'path';

export interface LogEntry {
    timestamp: string;    // ISO 8601
    task: string;         // What was done
    result: string;       // Outcome
    nextStep: string;     // What comes next
    module?: string;      // Module id (optional)
    level: 'INFO' | 'WARN' | 'SUCCESS' | 'ERROR';
}

const LOG_FILE = path.resolve(__dirname, 'dev-log.json');

export class DevLog {
    private entries: LogEntry[] = [];

    constructor() {
        // Load existing log from disk on startup
        if (fs.existsSync(LOG_FILE)) {
            try {
                const raw = fs.readFileSync(LOG_FILE, 'utf8');
                this.entries = JSON.parse(raw) as LogEntry[];
            } catch {
                this.entries = [];
            }
        }
    }

    /** Append a new log entry and persist to disk */
    add(entry: Omit<LogEntry, 'timestamp'>): LogEntry {
        const full: LogEntry = {
            timestamp: new Date().toISOString(),
            ...entry,
        };
        this.entries.push(full);
        this.persist();
        return full;
    }

    info(task: string, result: string, nextStep: string, module?: string) {
        return this.add({ task, result, nextStep, module, level: 'INFO' });
    }

    success(task: string, result: string, nextStep: string, module?: string) {
        return this.add({ task, result, nextStep, module, level: 'SUCCESS' });
    }

    warn(task: string, result: string, nextStep: string, module?: string) {
        return this.add({ task, result, nextStep, module, level: 'WARN' });
    }

    error(task: string, result: string, nextStep: string, module?: string) {
        return this.add({ task, result, nextStep, module, level: 'ERROR' });
    }

    /** Get the n most recent entries */
    getRecent(n = 20): LogEntry[] {
        return this.entries.slice(-n);
    }

    /** Get all entries */
    getAll(): LogEntry[] {
        return [...this.entries];
    }

    /** Get entries for a specific module */
    getForModule(moduleId: string): LogEntry[] {
        return this.entries.filter(e => e.module === moduleId);
    }

    /** Persist to disk */
    private persist() {
        try {
            fs.writeFileSync(LOG_FILE, JSON.stringify(this.entries, null, 2), 'utf8');
        } catch (err) {
            process.stderr.write(`[DevLog] Failed to persist log: ${err}\n`);
        }
    }

    /** Format a single entry for terminal display */
    static format(entry: LogEntry): string {
        const ts = new Date(entry.timestamp).toLocaleTimeString('en-IN', { hour12: false });
        const icons: Record<LogEntry['level'], string> = {
            INFO: '📋',
            WARN: '⚠️ ',
            SUCCESS: '✅',
            ERROR: '❌',
        };
        const icon = icons[entry.level];
        const mod = entry.module ? ` [${entry.module}]` : '';
        return `${icon} ${ts}${mod}  ${entry.task}\n   → ${entry.result}\n   ↪ Next: ${entry.nextStep}`;
    }
}
