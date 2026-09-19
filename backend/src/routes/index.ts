import { Router, Request, Response } from 'express';
import userRoutes from './userRoutes';
import projectRoutes from './projectRoutes';
import taskRoutes from './taskRoutes';
import statsRoutes from './statsRoutes';
import aiRoutes from './aiRoutes';
import authRoutes from './authRoutes';
import teamRoutes from './teamRoutes';
import { isMongoConnected } from '../lib/mongoClient';
import { supabase } from '../lib/supabaseClient';

const router = Router();

// Health check (reports both Supabase and MongoDB connectivity)
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      databases: {
        supabase: supabase ? 'configured' : 'not-configured',
        mongodb: isMongoConnected() ? 'connected' : 'not-connected',
      },
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
router.use('/teams', teamRoutes);

export default router;
