import { Request, Response, NextFunction } from 'express';

const SENSITIVE_KEYS = ['email', 'password', 'token', 'authorization', 'secret', 'apiKey', 'creditCard'];

/**
 * Deeply redacts sensitive fields from objects prior to logging
 */
function redactObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(redactObject);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = redactObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Request Logger Middleware with Sensitive Field Redaction
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    // Redact body and query if present
    const sanitizedQuery = redactObject(req.query);
    const sanitizedBody = req.method !== 'GET' ? redactObject(req.body) : undefined;

    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: statusCode,
      durationMs: duration,
      ...(Object.keys(sanitizedQuery).length > 0 && { query: sanitizedQuery }),
      ...(sanitizedBody && Object.keys(sanitizedBody).length > 0 && { body: sanitizedBody }),
    };

    console.log(`[HTTP] ${req.method} ${req.originalUrl} ${statusCode} - ${duration}ms`, JSON.stringify(logEntry));
  });

  next();
}
