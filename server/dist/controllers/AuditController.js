import { AuditService } from '../services/AuditService.js';
export const logAction = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { action, details } = req.body;
        const ip = req.ip || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        if (!action)
            return res.status(400).json({ message: 'Missing action' });
        await AuditService.log(userId, action, details, ip, userAgent);
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getLogs = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const limit = parseInt(req.query.limit) || 50;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const logs = await AuditService.getLogs(userId, limit);
        res.status(200).json(logs);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
