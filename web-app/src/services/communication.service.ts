import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    status: string;
    createdAt: string;
}

export class CommunicationService {
    /**
     * Finds or creates a 1:1 conversation between two users.
     */
    static async getOrCreateConversation(user1Id: string, user2Id: string) {
        if (!user1Id || !user2Id) throw new Error("Participant IDs are required");

        const db = await initDb();

        // Find existing conversation with both users
        const existing = await db.get(`
            SELECT cp1.conversationId 
            FROM ConversationParticipant cp1
            JOIN ConversationParticipant cp2 ON cp1.conversationId = cp2.conversationId
            WHERE cp1.userId = ? AND cp2.userId = ?
        `, [user1Id, user2Id]);

        if (existing) {
            return existing.conversationId;
        }

        // Create new conversation
        const conversationId = randomUUID();
        await db.run('INSERT INTO Conversation (id) VALUES (?)', [conversationId]);

        await db.run('INSERT INTO ConversationParticipant (conversationId, userId) VALUES (?, ?)', [conversationId, user1Id]);
        await db.run('INSERT INTO ConversationParticipant (conversationId, userId) VALUES (?, ?)', [conversationId, user2Id]);

        return conversationId;
    }

    /**
     * Gets all conversations for a user
     */
    static async getUserConversations(userId: string) {
        if (!userId) throw new Error("User ID is required");

        const db = await initDb();

        // This query gets conversations and the info of the OTHER participant
        const conversations = await db.all(`
            SELECT 
                c.id, 
                c.lastMessageAt,
                u.name as otherParticipantName,
                u.id as otherParticipantId,
                u.role as otherParticipantRole,
                (SELECT text FROM Message WHERE conversationId = c.id ORDER BY createdAt DESC LIMIT 1) as lastMessageText
            FROM Conversation c
            JOIN ConversationParticipant cp1 ON c.id = cp1.conversationId
            JOIN ConversationParticipant cp2 ON c.id = cp2.conversationId
            JOIN User u ON cp2.userId = u.id
            WHERE cp1.userId = ? AND cp2.userId != ?
            ORDER BY c.lastMessageAt DESC
        `, [userId, userId]);

        return conversations;
    }

    /**
     * Fetches message history for a conversation.
     */
    static async getHistory(conversationId: string) {
        if (!conversationId) throw new Error("Conversation ID is required");

        const db = await initDb();
        const messages = await db.all('SELECT * FROM Message WHERE conversationId = ? ORDER BY createdAt ASC', [conversationId]);

        return messages;
    }

    /**
     * Sends a message.
     */
    static async sendMessage(conversationId: string, senderId: string, text: string) {
        if (!conversationId || !senderId || !text) {
            throw new Error("Missing message parameters");
        }

        const db = await initDb();
        const messageId = randomUUID();

        await db.run(
            'INSERT INTO Message (id, conversationId, senderId, text) VALUES (?, ?, ?, ?)',
            [messageId, conversationId, senderId, text]
        );

        // Update conversation last message timestamp
        await db.run('UPDATE Conversation SET lastMessageAt = CURRENT_TIMESTAMP WHERE id = ?', [conversationId]);

        return { success: true, messageId, text, timestamp: new Date().toISOString() };
    }
}
