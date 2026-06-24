import express from 'express';
import cors from 'cors';

import { authApiRouter, authRouter } from './routes/auth.js';
import { dashboardRouter } from './routes/dashboard.js';
import { entitiesRouter } from './routes/entities.js';
import { healthRouter } from './routes/health.js';
import { setupRouter } from './routes/setup.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      credentials: true,
      origin: ['http://127.0.0.1:5173', 'http://localhost:5173']
    })
  );
  app.use(express.json());

  app.use('/auth', authRouter);
  app.use('/api/auth', authApiRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/health', healthRouter);
  app.use('/api/setup', setupRouter);
  app.use('/api', entitiesRouter);

  return app;
}
