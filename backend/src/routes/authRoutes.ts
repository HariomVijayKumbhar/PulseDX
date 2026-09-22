import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabase, supabaseAnon } from '../lib/supabaseClient';
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
      const resolvedAvatar =
        avatarUrl || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(fullName)}`;

      // 1. Public signup — this is the ONLY flow that triggers Supabase's
      //    confirmation email. Admin API users never get emails sent.
      const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
        email,
        password,
        options: {
          data: { name: fullName, full_name: fullName, avatar_url: resolvedAvatar },
          emailRedirectTo: process.env.SUPABASE_CONFIRM_REDIRECT_URL || undefined,
        },
      });

      if (signUpError) {
        if (
          signUpError.message.toLowerCase().includes('already') ||
          signUpError.status === 422
        ) {
          return res.status(409).json({
            error: {
              code: 'USER_ALREADY_EXISTS',
              message: 'An account with this email address already exists. Please sign in.',
            },
          });
        }
        return res.status(signUpError.status || 400).json({
          error: {
            code: 'AUTH_REGISTRATION_FAILED',
            message: signUpError.message,
          },
        });
      }

      const createdAuthUser = signUpData?.user;
      const emailConfirmationRequired =
        !!createdAuthUser && !createdAuthUser.email_confirmed_at && !signUpData?.session;

      // Dev-only: auto-confirm immediately so developers can skip the inbox step
      if (AUTO_CONFIRM && createdAuthUser) {
        try {
          await supabase.auth.admin.updateUserById(createdAuthUser.id, {
            email_confirm: true,
          });
        } catch (confirmErr: any) {
          console.warn('[Auth] Dev auto-confirm failed:', confirmErr?.message);
        }
      }

      // 2. Sync to public.users table for relational queries
      if (createdAuthUser) {
        const { error: dbError } = await supabase.from('users').upsert({
          id: createdAuthUser.id,
          email: createdAuthUser.email,
          name: fullName,
          avatar_url: resolvedAvatar,
          role: 'developer',
        });

        if (dbError) {
          console.warn('[Auth] Warning: Could not upsert user to public.users:', dbError.message);
        }
      }

      return res.status(201).json({
        data: {
          user: createdAuthUser,
          emailConfirmationRequired,
          message: emailConfirmationRequired
            ? 'Account created! Check your inbox for the confirmation email before signing in.'
            : 'Account registered. You can now sign in immediately.',
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
