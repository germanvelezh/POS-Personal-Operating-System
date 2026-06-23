import express from 'express';
import cors from 'cors';

import { authApiRouter, authRouter } from './routes/auth.js';
import { healthRouter } from './routes/health.js';

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
  app.use('/api/health', healthRouter);

  return app;
}
