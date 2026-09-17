import { Router, Request, Response } from 'express';
import userRoutes from './userRoutes';
import projectRoutes from './projectRoutes';
import taskRoutes from './taskRoutes';
import statsRoutes from './statsRoutes';
import aiRoutes from './aiRoutes';
import authRoutes from './authRoutes';

const router = Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// Resource routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/stats', statsRoutes);
router.use('/ai', aiRoutes);

export default router;
