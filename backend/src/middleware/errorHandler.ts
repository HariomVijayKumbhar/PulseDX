import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiErrorResponse } from '../models/api.model';

export class AppError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: any;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', id?: string) {
    super(id ? `${resource} with ID '${id}' was not found` : `${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Centralized Error-Handling Middleware
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response<ApiErrorResponse>,
  next: NextFunction
): void {
  const isProduction = process.env.NODE_ENV === 'production';

  // Server-side logging (full stack trace for developers)
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, {
    name: err.name,
    message: err.message,
    stack: isProduction ? undefined : err.stack,
  });

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedDetails = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      error: {
        message: 'Validation failed on request data',
        code: 'VALIDATION_ERROR',
        details: formattedDetails,
      },
    });
    return;
  }

  // Handle Operational App Errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    });
    return;
  }

  // Handle Body-parser / JSON Syntax Errors
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    res.status(400).json({
      error: {
        message: 'Malformed JSON payload in request body',
        code: 'INVALID_JSON',
      },
    });
    return;
  }

  // Unhandled / 500 Internal Server Errors
  const clientMessage = isProduction ? 'Internal server error' : err.message;

  res.status(500).json({
    error: {
      message: clientMessage,
      code: 'INTERNAL_SERVER_ERROR',
      details: isProduction ? undefined : err.stack,
    },
  });
}
