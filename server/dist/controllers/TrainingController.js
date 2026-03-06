import { TrainingService } from '../services/TrainingService.js';
export const getProgress = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const progress = await TrainingService.getProgress(userId);
        res.status(200).json(progress);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateProgress = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { courseId, increment, progress } = req.body;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!courseId) {
            return res.status(400).json({ message: 'Missing courseId' });
        }
        const result = await TrainingService.updateProgress(userId, courseId, increment, progress);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
