import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { authenticate, requireAuth } from '../middleware/auth';

const router = Router();

// Stats are scoped to the authenticated account
router.get('/overview', authenticate, requireAuth, taskController.getStatsOverview);

export default router;
