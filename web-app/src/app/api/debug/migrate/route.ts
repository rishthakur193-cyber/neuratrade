
import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function GET() {
    try {
        console.log('--- Triggering Manual Migration via API ---');
        const db = await initDb();

        // Let's also verify tables
        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
        const tableNames = tables.map((t: any) => t.name);

        console.log('Tables after migration:', tableNames);

        return NextResponse.json({
            success: true,
            message: 'Migration triggered',
            tables: tableNames
        });
    } catch (error: any) {
        console.error('Migration API Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
