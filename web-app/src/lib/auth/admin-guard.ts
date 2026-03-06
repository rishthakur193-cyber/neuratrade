import { NextResponse } from 'next/server';

/**
 * Simple Admin Route Protection Wrapper
 * 
 * In a production Next.js app, this would use NextAuth.js or custom middleware.
 * For this MVP Admin panel, we simulate the role check.
 */

export async function adminGuard(userId: string, handler: () => Promise<NextResponse>) {
    // Simulate fetching user from DB and checking role
    // In production, this would come from session/JWT
    if (userId !== 'admin-user-id') { // Mock check
        return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }
    return handler();
}
