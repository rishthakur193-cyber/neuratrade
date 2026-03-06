import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import prisma from '../lib/prisma.js';
import { AuditService } from './AuditService.js';
import { EmailService } from './EmailService.js';
// import { Role } from '@prisma/client';
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev-only';
export class AuthService {
    static async register(data) {
        const { name, email, password, role, sebiRegNo } = data;
        if (!name || !email || !role)
            throw new Error("Missing required fields");
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser)
            throw new Error("Email already registered");
        const passwordHash = await bcrypt.hash(password || 'Neura@2026', 10);
        const outcome = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    role,
                }
            });
            // If Advisor role, attach profile automatically
            if (role === 'ADVISOR') {
                const regNo = sebiRegNo || `INA${Math.floor(100000 + Math.random() * 900000)}`;
                const vintage = parseInt(data.yearsOfExperience || '0') || 0;
                const mandate = data.mandateScale || 'RETAIL: < 10 CR';
                await tx.advisorProfile.create({
                    data: {
                        userId: user.id,
                        sebiRegNo: regNo,
                        experienceYears: vintage,
                        tier: 'Registered',
                        bio: `SEBI Registered Advisor - ${regNo}`
                    }
                });
            }
            // If Trainee role, attach trainee profile
            if (role === 'TRAINEE') {
                await tx.traineeProfile.create({
                    data: {
                        userId: user.id,
                        nismProgress: 0,
                        milestonesDone: 0
                    }
                });
            }
            // If Investor role, initialize profile
            if (role === 'INVESTOR') {
                await tx.investorProfile.create({
                    data: {
                        userId: user.id,
                        riskTolerance: 'Moderate'
                    }
                });
            }
            return user;
        });
        // Dispatch Welcome Email asynchronously
        EmailService.sendWelcomeEmail(email, name).catch(console.error);
        return { userId: outcome.id, role: outcome.role };
    }
    static async login({ email, password, totpCode }, context = {}) {
        if (!email || !password) {
            throw new Error('Missing email or password');
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid)
            throw new Error('Invalid credentials');
        // Check if 2FA is required
        if (user.twoFactorEnabled && !totpCode) {
            return { requires2FA: true, email: user.email };
        }
        if (user.twoFactorEnabled && totpCode && user.twoFactorSecret) {
            const totp = new OTPAuth.TOTP({
                issuer: 'NeuraTrade',
                label: user.email,
                algorithm: 'SHA1',
                digits: 6,
                period: 30,
                secret: user.twoFactorSecret,
            });
            const delta = totp.validate({ token: totpCode, window: 1 });
            if (delta === null)
                throw new Error('Invalid 2FA code');
        }
        // Generate JWT
        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
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
    static async setup2FA(userId) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
        if (!user)
            throw new Error("User not found");
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
        await prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret.base32, twoFactorEnabled: false }
        });
        return { secret: secret.base32, qrCode: qrCodeDataUrl };
    }
    static async verifyAndEnable2FA(userId, code) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { twoFactorSecret: true, email: true } });
        if (!user || !user.twoFactorSecret)
            throw new Error("2FA setup not initiated");
        const totp = new OTPAuth.TOTP({
            issuer: 'NeuraTrade',
            label: user.email,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: user.twoFactorSecret,
        });
        const delta = totp.validate({ token: code, window: 1 });
        if (delta === null)
            throw new Error("Invalid verification code");
        await prisma.user.update({
            where: { id: userId },
            data: { twoFactorEnabled: true }
        });
        await AuditService.log(userId, '2FA_ENABLED', { email: user.email });
        EmailService.sendSecurityAlert(user.email, 'Two-Factor Authentication Enabled', 'Verified Device').catch(console.error);
        return { success: true, message: "Two-factor authentication enabled" };
    }
    static async me(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, name: true, email: true, role: true, kycStatus: true }
            });
            if (!user) {
                throw new Error('User not found');
            }
            if (user.role === 'ADVISOR') {
                const profile = await prisma.advisorProfile.findUnique({ where: { userId: user.id } });
                return { ...user, advisorProfile: profile };
            }
            if (user.role === 'TRAINEE') {
                const profile = await prisma.traineeProfile.findUnique({ where: { userId: user.id } });
                return { ...user, traineeProfile: profile };
            }
            return user;
        }
        catch (err) {
            throw new Error('Invalid token');
        }
    }
    static async updateKyc(userId, documents) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        await prisma.user.update({
            where: { id: userId },
            data: {
                kycStatus: 'PENDING',
                // Assuming documents is a stringified array in the schema
                kycDocuments: JSON.stringify(documents)
            }
        });
        await AuditService.log(userId, 'KYC_UPDATE', { docCount: documents.length });
        return { success: true, message: 'KYC Documents uploaded successfully and are under review' };
    }
}
