import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        let responseText = "I'm your NeuraTrade AI Assistant. How can I help you navigate the institutional platform?";
        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes('subscribe') || lowerMsg.includes('pricing') || lowerMsg.includes('upgrade')) {
            responseText = "You can upgrade to an institutional node by navigating to our [Global Protocol: Pricing](/pricing) page. We offer a 14-day Free Trial for new accounts!";
        } else if (lowerMsg.includes('verify') || lowerMsg.includes('trust') || lowerMsg.includes('advisor')) {
            responseText = "All fiduciaries on our platform undergo strict SEBI registration checks. You can visit the [Trust Center](/trust-center) to view verified leaderboards and our 95% Confidence VaR metrics.";
        } else if (lowerMsg.includes('complaint') || lowerMsg.includes('issue') || lowerMsg.includes('fraud')) {
            const ticketId = randomUUID().split('-')[0].toUpperCase();
            responseText = `I have logged your concern under Priority Investigation Ticket #${ticketId}. Our compliance team monitors the network 24/7 and will evaluate your report against the Fraud Radar logs immediately.`;
        } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            responseText = "Hello! I am the Ecosystem OS Assistant. Are you looking to find an advisor, manage your portfolio, or deploy a new node today?";
        } else {
            responseText = "I'm constantly learning about our platform mechanics. For specific actions, try asking about 'subscriptions', 'verifying advisors', or 'reporting an issue'.";
        }

        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 800));

        return NextResponse.json({
            success: true,
            reply: responseText,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
