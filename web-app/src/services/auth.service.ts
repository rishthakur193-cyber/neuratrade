import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDb } from '@/lib/db';
import { randomUUID } from 'crypto';
import { AuditService } from './audit.service';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { EmailService } from './email.service';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'super-secret-key-change-in-production-ecosystem-2026';

export class AuthService {
    static async register({ name, email, password, role = 'INVESTOR', sebiRegNo }: any, context: any = {}) {
        if (!name || !email || !password) {
            throw new Error('Missing required fields');
        }

        const db = await initDb();

        // Check if user exists
        const existing = await db.get('SELECT * FROM User WHERE email = ?', [email]);
        if (existing) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = randomUUID();

        // Insert User
        await db.run(
            'INSERT INTO User (id, name, email, passwordHash, role) VALUES (?, ?, ?, ?, ?)',
            [userId, name, email, hashedPassword, role]
        );

        // If Advisor role, attach profile automatically
        if (role === 'ADVISOR') {
            const profileId = randomUUID();
            const regNo = sebiRegNo || `INA${Math.floor(100000 + Math.random() * 900000)}`;

            await db.run(
                'INSERT INTO AdvisorProfile (id, userId, sebiRegNo) VALUES (?, ?, ?)',
                [profileId, userId, regNo]
            );
        }

        // Dispatch Welcome Email asynchronously
        EmailService.sendWelcomeEmail(email, name).catch(console.error);

        return { userId, role };
    }

    static async login({ email, password, totpCode }: any, context: any = {}) {
        if (!email || !password) {
            throw new Error('Missing email or password');
        }

        const db = await initDb();
        const user = await db.get('SELECT * FROM User WHERE email = ?', [email]);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) throw new Error('Invalid credentials');

        // Check if 2FA is required
        if (user.twoFactorEnabled && !totpCode) {
            return { requires2FA: true, email: user.email };
        }

        if (user.twoFactorEnabled && totpCode) {
            const totp = new OTPAuth.TOTP({
                issuer: 'NeuraTrade',
                label: user.email,
                algorithm: 'SHA1',
                digits: 6,
                period: 30,
                secret: user.twoFactorSecret,
            });
            const delta = totp.validate({ token: totpCode, window: 1 });
            if (delta === null) throw new Error('Invalid 2FA code');
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            kycStatus: user.kycStatus,
            twoFactorEnabled: !!user.twoFactorEnabled
        };

        await AuditService.log(user.id, 'USER_LOGIN', { email, twoFactorUsed: !!user.twoFactorEnabled }, context.ip, context.userAgent);

        return { token, user: payload };
    }

    static async setup2FA(userId: string) {
        const db = await initDb();
        const user = await db.get('SELECT email FROM User WHERE id = ?', [userId]);
        if (!user) throw new Error("User not found");

        const secret = new OTPAuth.Secret({ size: 20 });
        const totp = new OTPAuth.TOTP({
            issuer: 'NeuraTrade',
            label: user.email,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: secret,
        });

        const otpauthUrl = totp.toString();
        const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

        await db.run('UPDATE User SET twoFactorSecret = ?, twoFactorEnabled = 0 WHERE id = ?', [secret.base32, userId]);

        return { secret: secret.base32, qrCode: qrCodeDataUrl };
    }

    static async verifyAndEnable2FA(userId: string, code: string) {
        const db = await initDb();
        const user = await db.get('SELECT twoFactorSecret, email FROM User WHERE id = ?', [userId]);
        if (!user || !user.twoFactorSecret) throw new Error("2FA setup not initiated");

        const totp = new OTPAuth.TOTP({
            issuer: 'NeuraTrade',
            label: user.email,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: user.twoFactorSecret,
        });

        const delta = totp.validate({ token: code, window: 1 });
        if (delta === null) throw new Error("Invalid verification code");

        await db.run('UPDATE User SET twoFactorEnabled = 1 WHERE id = ?', [userId]);
        await AuditService.log(userId, '2FA_ENABLED', { email: user.email });

        // Dispatch Security Alert regarding strict 2FA implementation
        EmailService.sendSecurityAlert(user.email, 'Two-Factor Authentication Enabled', 'Verified Device').catch(console.error);

        return { success: true, message: "Two-factor authentication enabled" };
    }

    static async me(token: string) {
        try {
            const decoded: any = jwt.verify(token, JWT_SECRET);
            const db = await initDb();

            const user = await db.get('SELECT id, name, email, role, kycStatus FROM User WHERE id = ?', [decoded.userId]);

            if (!user) {
                throw new Error('User not found');
            }

            if (user.role === 'ADVISOR') {
                const profile = await db.get('SELECT * FROM AdvisorProfile WHERE userId = ?', [user.id]);
                return { ...user, advisorProfile: profile };
            }

            return user;
        } catch (err) {
            throw new Error('Invalid token');
        }
    }

    static async resetPassword({ email, newPassword }: any, context: any = {}) {
        if (!email || !newPassword) {
            throw new Error('Missing required fields');
        }

        const db = await initDb();
        const user = await db.get('SELECT * FROM User WHERE email = ?', [email]);

        if (!user) {
            throw new Error('User not found');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.run('UPDATE User SET passwordHash = ? WHERE email = ?', [hashedPassword, email]);

        await AuditService.log(user.id, 'PASSWORD_RESET', { email }, context.ip, context.userAgent);

        // Security push to previous email state
        EmailService.sendSecurityAlert(email, 'Master Password Reset', context.ip).catch(console.error);

        return { message: 'Password updated successfully' };
    }

    static async updateKyc(userId: string, documents: any[]) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const db = await initDb();
        const user = await db.get('SELECT id FROM User WHERE id = ?', [userId]);
        if (!user) throw new Error('User not found');

        await db.run('UPDATE User SET kycStatus = ? WHERE id = ?', ['PENDING', userId]);
        await AuditService.log(userId, 'KYC_UPDATE', { docCount: documents.length });

        return { success: true, message: 'KYC Documents uploaded successfully and are under review' };
    }
}
