import { NextResponse } from 'next/server';
import { CommunicationService } from '@/services/communication.service';
import { AuthService } from '@/services/auth.service';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const conversationId = url.searchParams.get('conversationId');

        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const user = await AuthService.me(token);

        if (!user) {
            return NextResponse.json({ error: 'Session Invalid' }, { status: 401 });
        }

        if (conversationId) {
            const messages = await CommunicationService.getHistory(conversationId);
            return NextResponse.json({ messages }, { status: 200 });
        } else {
            const conversations = await CommunicationService.getUserConversations(user.id);
            return NextResponse.json({ conversations }, { status: 200 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const user = await AuthService.me(token);

        if (!user) {
            return NextResponse.json({ error: 'Session Invalid' }, { status: 401 });
        }

        const body = await req.json();
        const { conversationId, text, targetUserId } = body;

        if (text && conversationId) {
            const result = await CommunicationService.sendMessage(conversationId, user.id, text);
            return NextResponse.json(result, { status: 201 });
        } else if (targetUserId) {
            const convId = await CommunicationService.getOrCreateConversation(user.id, targetUserId);
            return NextResponse.json({ conversationId: convId }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
