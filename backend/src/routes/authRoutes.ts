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

// Auto-confirm is reserved for local/dev/testing so you don't have to click
// email links while developing. In production (Render etc.) the real
// confirmation email flow is used.
const AUTO_CONFIRM = process.env.NODE_ENV !== 'production' &&
  process.env.SUPABASE_AUTO_CONFIRM_USERS === 'true';

/**
 * POST /api/auth/register
 * Creates a user via Supabase Admin API. Email confirmation is governed by the
 * project's Supabase Auth settings — with "Confirm email" enabled (default)
 * Supabase sends the confirmation email and the user must click the link
 * before they can sign in.
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
        email_confirm: AUTO_CONFIRM,
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
          emailConfirmationRequired: !createdAuthUser.email_confirmed_at && !AUTO_CONFIRM,
          message:
            createdAuthUser.email_confirmed_at || AUTO_CONFIRM
              ? 'Account registered. You can now sign in immediately.'
              : 'Account created! Check your inbox for the confirmation email before signing in.',
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
