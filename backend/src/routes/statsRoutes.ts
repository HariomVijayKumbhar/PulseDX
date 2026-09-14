import { Router } from 'express';
import { taskController } from '../controllers/taskController';

const router = Router();

// GET /api/stats/overview - Aggregated statistics for dashboard
router.get('/overview', taskController.getStatsOverview);

export default router;
