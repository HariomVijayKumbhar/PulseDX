import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { connectMongo, isMongoConnected } from '../lib/mongoClient';
import Team, { TeamMember } from '../models/mongo/Team';
import { requireAuth } from '../middleware/auth';
import { writeLimiter } from '../middleware/rateLimiter';

const router = Router();

const createTeamSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(300).optional(),
  projectIds: z.array(z.string().uuid()).optional(),
});

const addMemberSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).max(80),
  email: z.string().email(),
  role: z.enum(['admin', 'member']).optional(),
});

const attachProjectSchema = z.object({
  projectId: z.string().uuid(),
});

/** Teams live in MongoDB — ensure a connection before handling a request. */
async function ensureMongo() {
  if (!isMongoConnected()) await connectMongo();
}

// ── GET /api/teams — list all teams
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureMongo();
    const teams = await Team.find().sort({ createdAt: -1 }).lean();
    res.json({ data: teams, meta: { count: teams.length, timestamp: new Date().toISOString() } });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/teams/:id — single team
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureMongo();
    const team = await Team.findById(req.params.id).lean();
    if (!team) {
      return res.status(404).json({ error: { message: 'Team not found' } });
    }
    res.json({ data: team, meta: { timestamp: new Date().toISOString() } });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/teams — create a team (auth required)
router.post(
  '/',
  requireAuth,
  writeLimiter,
  validate({ body: createTeamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureMongo();
      const { name, description, projectIds } = req.body;
      const ownerId = (req as any).user?.id ?? '00000-0000-0000-0000-000';

      const team = await Team.create({
        name,
        description: description ?? '',
        ownerId,
        projectIds: projectIds ?? [],
        members: [
          {
            userId: ownerId,
            name: (req as any).user?.email?.split('@')[0] ?? 'Owner',
            email: (req as any).user?.email ?? 'owner@pulsedx.dev',
            role: 'owner' as const,
            joinedAt: new Date(),
          },
        ],
      });

      res.status(201).json({ data: team.toObject(), meta: { timestamp: new Date().toISOString() } });
    } catch (error: any) {
      if (error?.code === 11000) {
        return res.status(409).json({ error: { message: 'A team with this name already exists' } });
      }
      next(error);
    }
  }
);

// ── POST /api/teams/:id/members — add a member
router.post(
  '/:id/members',
  requireAuth,
  writeLimiter,
  validate({ body: addMemberSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureMongo();
      const { userId, name, email, role } = req.body;
      const team = await Team.findById(req.params.id);
      if (!team) {
        return res.status(404).json({ error: { message: 'Team not found' } });
      }
      if (team.members.some((m: TeamMember) => m.userId === userId)) {
        return res.status(409).json({ error: { message: 'User is already a member' } });
      }
      team.members.push({ userId, name, email, role: role ?? 'member', joinedAt: new Date() });
      await team.save();
      res.json({ data: team.toObject(), meta: { timestamp: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/teams/:id/projects — attach a project to the team
router.post(
  '/:id/projects',
  requireAuth,
  writeLimiter,
  validate({ body: attachProjectSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureMongo();
      const { projectId } = req.body;
      const team = await Team.findById(req.params.id);
      if (!team) {
        return res.status(404).json({ error: { message: 'Team not found' } });
      }
      if (!team.projectIds.includes(projectId)) {
        team.projectIds.push(projectId);
        await team.save();
      }
      res.json({ data: team.toObject(), meta: { timestamp: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
