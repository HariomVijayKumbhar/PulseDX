import { Request, Response, NextFunction } from 'express';

// Extend Express Request object to hold authenticated user context in Task 4
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: string;
      };
    }
  }
}

/**
 * ============================================================================
 * PLACEHOLDER AUTHENTICATION MIDDLEWARE (TASK 4 READY)
 * ============================================================================
 * TODO (Task 4):
 * 1. Extract Bearer token from req.headers.authorization
 * 2. Verify JWT using process.env.JWT_SECRET
 * 3. Attach decoded user payload to req.user
 * 4. Return 401 Unauthorized if token is missing or invalid
 *
 * Currently, in Task 2 this middleware acts as an optional pass-through or
 * attaches a mock user context if an Authorization header is supplied.
 * ============================================================================
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    // Placeholder mock verification: attach mock identity
    req.user = {
      id: 'usr_98a72f01',
      email: 'alex.vance@acme-labs.io',
      role: 'lead_developer',
    };
  }

  // Pass through to next handler (Task 2 backend-only phase)
  next();
}

/**
 * Optional strict guard for protected routes (Task 4 preview)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // TODO (Task 4): Uncomment strict enforcement when real login is integrated:
  // if (!req.user) {
  //   return res.status(401).json({
  //     error: {
  //       message: 'Authentication token is required to access this resource',
  //       code: 'UNAUTHORIZED',
  //     },
  //   });
  // }
  next();
}
