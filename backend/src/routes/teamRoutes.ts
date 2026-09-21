import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { supabase } from '../lib/supabaseClient';
import { authenticate, requireAuth } from '../middleware/auth';
import { writeLimiter } from '../middleware/rateLimiter';
import { handleSupabaseError } from '../utils/dbError';

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

/**
 * Teams are stored in Supabase Postgres (same data layer as the rest of the app).
 * Rows are mapped back into the Mongo-era DTO shape (id → _id) so the existing
 * frontend contract keeps working unchanged.
 */
function toDto(row: any) {
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    ownerId: row.owner_id,
    projectIds: row.project_ids ?? [],
    members: row.members ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const TEAM_SELECT = 'id, name, description, owner_id, project_ids, members, created_at, updated_at';

// ── GET /api/teams — list all teams
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select(TEAM_SELECT)
      .order('created_at', { ascending: false });
    if (error) {
      handleSupabaseError(error, 'Team');
    }
    res.json({ data: (data || []).map(toDto), meta: { count: data?.length ?? 0, timestamp: new Date().toISOString() } });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/teams/:id — single team
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase.from('teams').select(TEAM_SELECT).eq('id', req.params.id).maybeSingle();
    if (error) {
      handleSupabaseError(error, 'Team');
    }
    if (!data) {
      return res.status(404).json({ error: { message: 'Team not found' } });
    }
    res.json({ data: toDto(data), meta: { timestamp: new Date().toISOString() } });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/teams — create a team (auth required)
router.post(
  '/',
  authenticate,
  requireAuth,
  writeLimiter,
  validate({ body: createTeamSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, projectIds } = req.body;
      const ownerId = (req as any).user?.id ?? '00000000-0000-0000-0000-000000000000';

      const members = [
        {
          userId: ownerId,
          name: (req as any).user?.email?.split('@')[0] ?? 'Owner',
          email: (req as any).user?.email ?? 'owner@pulsedx.dev',
          role: 'owner' as const,
          joinedAt: new Date().toISOString(),
        },
      ];

      const { data, error } = await supabase
        .from('teams')
        .insert({
          name,
          description: description ?? '',
          owner_id: ownerId,
          project_ids: projectIds ?? [],
          members,
        })
        .select(TEAM_SELECT)
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: { message: 'A team with this name already exists' } });
        }
        handleSupabaseError(error, 'Team');
      }

      res.status(201).json({ data: toDto(data), meta: { timestamp: new Date().toISOString() } });
    } catch (error: any) {
      next(error);
    }
  }
);

// ── POST /api/teams/:id/members — add a member
router.post(
  '/:id/members',
  authenticate,
  requireAuth,
  writeLimiter,
  validate({ body: addMemberSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, name, email, role } = req.body;

      const { data: team, error: fetchError } = await supabase
        .from('teams')
        .select(TEAM_SELECT)
        .eq('id', req.params.id)
        .maybeSingle();
      if (fetchError) {
        handleSupabaseError(fetchError, 'Team');
      }
      if (!team) {
        return res.status(404).json({ error: { message: 'Team not found' } });
      }
      if ((team.members ?? []).some((m: any) => m.userId === userId)) {
        return res.status(409).json({ error: { message: 'User is already a member' } });
      }

      const updatedMembers = [
        ...(team.members ?? []),
        { userId, name, email, role: role ?? 'member', joinedAt: new Date().toISOString() },
      ];
      const { data, error } = await supabase
        .from('teams')
        .update({ members: updatedMembers, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select(TEAM_SELECT)
        .single();
      if (error) {
        handleSupabaseError(error, 'Team');
      }

      res.json({ data: toDto(data), meta: { timestamp: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  }
);

// ── POST /api/teams/:id/projects — attach a project to the team
router.post(
  '/:id/projects',
  authenticate,
  requireAuth,
  writeLimiter,
  validate({ body: attachProjectSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.body;

      const { data: team, error: fetchError } = await supabase
        .from('teams')
        .select(TEAM_SELECT)
        .eq('id', req.params.id)
        .maybeSingle();
      if (fetchError) {
        handleSupabaseError(fetchError, 'Team');
      }
      if (!team) {
        return res.status(404).json({ error: { message: 'Team not found' } });
      }

      const projectIds: string[] = team.project_ids ?? [];
      if (!projectIds.includes(projectId)) {
        projectIds.push(projectId);
        const { data, error } = await supabase
          .from('teams')
          .update({ project_ids: projectIds, updated_at: new Date().toISOString() })
          .eq('id', req.params.id)
          .select(TEAM_SELECT)
          .single();
        if (error) {
          handleSupabaseError(error, 'Team');
        }
        return res.json({ data: toDto(data), meta: { timestamp: new Date().toISOString() } });
      }

      res.json({ data: toDto(team), meta: { timestamp: new Date().toISOString() } });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
