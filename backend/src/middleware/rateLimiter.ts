import rateLimit from 'express-rate-limit';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes
const maxGeneral = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '600', 10);
const maxWrite = parseInt(process.env.RATE_LIMIT_WRITE_MAX_REQUESTS || '150', 10);

/**
 * General rate limiter for read operations and overall API traffic
 */
export const generalLimiter = rateLimit({
  windowMs,
  max: maxGeneral,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development',
  message: {
    error: {
      message: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});

/**
 * Stricter rate limiter for mutating operations (POST, PATCH, DELETE)
 */
export const writeLimiter = rateLimit({
  windowMs,
  max: maxWrite,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development',
  message: {
    error: {
      message: 'Too many mutation requests from this IP, please slow down',
      code: 'WRITE_RATE_LIMIT_EXCEEDED',
    },
  },
});
