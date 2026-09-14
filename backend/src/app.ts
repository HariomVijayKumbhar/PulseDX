import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import swaggerDocument from './docs/swagger';
import apiRouter from './routes/index';
import { generalLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './middleware/errorHandler';

const app = express();

// ── Security headers
app.use(helmet());

// ── CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// ── Body parsing (10 kb payload limit)
app.use(express.json({ limit: '10kb' }));

// ── Rate limiting on all /api routes
app.use('/api', generalLimiter);

// ── Request logger
app.use(requestLogger);

// ── Swagger UI (must come before API routes so /api/docs is reachable)
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'PulseDX API Docs',
    swaggerOptions: { persistAuthorization: true },
  })
);

// ── Root route (API info)
app.get('/', (_req: Request, res: Response) => {
  res.json({
    data: {
      name: 'PulseDX API',
      docs: '/api/docs',
      health: '/api/health',
      endpoints: ['/api/users', '/api/projects', '/api/tasks'],
    },
  });
});

// ── API routes
app.use('/api', apiRouter);

// ── 404 handler for any route not matched above
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError());
});

// ── Centralised error handler (must be last)
app.use(errorHandler);

export default app;
