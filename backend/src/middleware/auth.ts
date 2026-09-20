import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabaseClient';

// Extend Express Request object to hold authenticated user context
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
      };
    }
  }
}

/**
 * Authentication middleware that extracts Bearer token and verifies via Supabase auth
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) {
        // In permissive/optional phase, pass through or let requireAuth guard it
      } else {
        req.user = {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
        };

        const fullName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email?.split('@')[0] ||
          'Developer';
        const avatarUrl = data.user.user_metadata?.avatar_url || null;

        // Ensure user row exists in public.users for foreign key constraints
        try {
          await supabase.from('users').upsert({
            id: data.user.id,
            email: data.user.email,
            name: fullName,
            avatar_url: avatarUrl,
            role: data.user.role || 'developer',
          });
        } catch (syncErr: any) {
          console.warn('[Auth] Sync public.users notice:', syncErr?.message);
        }
      }
    } catch (err) {
      console.error('Supabase JWT verification failed:', err);
    }
  }

  next();
}

/**
 * Strict guard for protected routes (rejects unauthenticated requests with 401)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      error: {
        message: 'Authentication token is required to access this resource',
        code: 'UNAUTHORIZED',
      },
    });
    return;
  }
  next();
}
