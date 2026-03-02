import nodemailer from 'nodemailer';

export class EmailService {
    private static transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    /**
     * Send a transactional email. 
     * If SMTP credentials are not fully provided, it logs the attempt dynamically instead of throwing in development.
     */
    static async sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn(`[Mock Email] To: ${to} | Subject: ${subject}`);
            console.warn(`[Mock Email Body Length] ${html.length} characters.`);
            return { success: true, mock: true };
        }

        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"NeuraTrade Platform" <noreply@neuratrade.ecosystem>',
                to,
                subject,
                html,
            });
            return { success: true, messageId: info.messageId };
        } catch (error: any) {
            console.error('Email Delivery Failed:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    static async sendWelcomeEmail(to: string, name: string) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; background-color: #0B0B12; color: #ffffff; padding: 40px; border-radius: 8px;">
                <h1 style="color: #00E676; letter-spacing: 2px;">NEURATRADE</h1>
                <h2>Welcome to the Ecosystem, ${name}</h2>
                <p>Your institutional grade trading account has been successfully initialized.</p>
                <p>Ensure you complete your KYC protocols to unlock derivative markets.</p>
                <br/>
                <p style="font-size: 10px; color: #888;">&copy; 2026 NeuraTrade Ecosystem</p>
            </div>
        `;
        return this.sendEmail({ to, subject: 'Welcome to NeuraTrade Ecosystem', html });
    }

    static async sendSecurityAlert(to: string, action: string, ip: string) {
        const html = `
            <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; background-color: #0B0B12; color: #ffffff; padding: 40px; border-radius: 8px; border-top: 4px solid #FF5252;">
                <h1 style="color: #FF5252; letter-spacing: 2px;">SECURITY ALERT</h1>
                <p>We detected a sensitive security action on your account.</p>
                <p><strong>Action:</strong> ${action}</p>
                <p><strong>IP Address:</strong> ${ip || 'Unknown'}</p>
                <p>If this was not you, please secure your account immediately or contact priority support.</p>
            </div>
        `;
        return this.sendEmail({ to, subject: 'NeuraTrade Security Protocol Triggered', html });
    }
}
