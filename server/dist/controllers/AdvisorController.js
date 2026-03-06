import { AdvisorService } from '../services/AdvisorService.js';
export const getClients = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const clients = await AdvisorService.getClients(userId);
        res.status(200).json(clients);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const acceptLead = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { investorId } = req.body;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        if (!investorId)
            return res.status(400).json({ message: 'Missing investorId' });
        const result = await AdvisorService.acceptLead(userId, investorId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
