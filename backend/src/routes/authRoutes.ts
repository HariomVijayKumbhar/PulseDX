import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabaseClient';
import { validate } from '../middleware/validate';
import { writeLimiter } from '../middleware/rateLimiter';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatarUrl: z.string().url().optional(),
});

/**
 * POST /api/auth/register
 * Creates a user with auto-confirmed email via Supabase Admin API
 * and syncs them with the public.users database table.
 */
router.post(
  '/register',
  writeLimiter,
  validate({ body: registerSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name, avatarUrl } = req.body;
      const fullName = name || email.split('@')[0];

      // 1. Create user in Supabase Auth with auto-confirmed email
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name: fullName,
          full_name: fullName,
          avatar_url: avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(fullName)}`,
        },
      });

      if (authError) {
        // If user already exists in Auth, return 409
        if (authError.message.toLowerCase().includes('already') || authError.status === 422) {
          return res.status(409).json({
            error: {
              code: 'USER_ALREADY_EXISTS',
              message: 'An account with this email address already exists. Please sign in.',
            },
          });
        }
        return res.status(authError.status || 400).json({
          error: {
            code: 'AUTH_REGISTRATION_FAILED',
            message: authError.message,
          },
        });
      }

      const createdAuthUser = authData.user;

      // 2. Sync to public.users table for relational queries
      if (createdAuthUser) {
        const { error: dbError } = await supabase.from('users').upsert({
          id: createdAuthUser.id,
          email: createdAuthUser.email,
          name: fullName,
          avatar_url: avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(fullName)}`,
          role: 'developer',
        });

        if (dbError) {
          console.warn('[Auth] Warning: Could not upsert user to public.users:', dbError.message);
        }
      }

      return res.status(201).json({
        data: {
          user: createdAuthUser,
          message: 'Account registered and email auto-confirmed. You can now sign in immediately.',
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
