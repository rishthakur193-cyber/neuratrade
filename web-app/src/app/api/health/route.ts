import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function GET() {
    try {
        // Quick DB Ping check
        const db = await initDb();
        await db.get('SELECT 1');

        return NextResponse.json(
            {
                status: 'operational',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV,
                database: process.env.DATABASE_URL?.startsWith('postgres') ? 'PostgreSQL' : 'SQLite-Fallback',
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            {
                status: 'degraded',
                error: error.message,
                timestamp: new Date().toISOString(),
            },
            { status: 503 }
        );
    }
}
