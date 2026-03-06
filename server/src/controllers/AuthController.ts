import type { Request, Response } from 'express';
import { AuthService } from '../services/AuthService.js';
import type { AuthRequest } from '../middleware/authMiddleware.js';

// Alias for clarity and to avoid global Response conflict
type ExpressResponse = Response;

import fs from 'fs';
export const register = async (req: Request, res: ExpressResponse) => {
    try {
        const logMsg = `[${new Date().toISOString()}] Incoming: ${JSON.stringify(req.body)}\n`;
        fs.appendFileSync('C:/Users/risha/ecosystem of smart investing/server/debug_reg.log', logMsg);
        const result = await AuthService.register(req.body);
        res.status(201).json({ message: 'User created successfully', ...result });
    } catch (error: any) {
        fs.appendFileSync('C:/Users/risha/ecosystem of smart investing/server/debug_reg.log', `[${new Date().toISOString()}] Error: ${error.message}\n`);
        const status = error.message === 'Email already registered' ? 409 : 400;
        res.status(status).json({ message: error.message });
    }
};

export const login = async (req: Request, res: ExpressResponse) => {
    try {
        const context = {
            ip: req.ip || 'unknown',
            userAgent: req.get('user-agent') || 'unknown'
        };
        const result = await AuthService.login(req.body, context);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};

export const me = async (req: Request, res: ExpressResponse) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Missing or invalid token' });
        }
        const token = authHeader.split(' ')[1];
        const user = await AuthService.me(token);
        res.status(200).json(user);
    } catch (error: any) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export const setup2FA = async (req: AuthRequest, res: ExpressResponse) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const result = await AuthService.setup2FA(userId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const verify2FA = async (req: AuthRequest, res: ExpressResponse) => {
    try {
        const userId = req.user?.userId;
        const { code } = req.body;
        if (!userId || !code) return res.status(400).json({ message: 'Missing userId or code' });

        const result = await AuthService.verifyAndEnable2FA(userId, code);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateKyc = async (req: AuthRequest, res: ExpressResponse) => {
    try {
        const userId = req.user?.userId;
        const { documents } = req.body;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const result = await AuthService.updateKyc(userId, documents || []);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
