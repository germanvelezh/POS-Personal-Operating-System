import express from 'express';
import cors from 'cors';

import { healthRouter } from './routes/health.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: 'http://127.0.0.1:5173' }));
  app.use(express.json());

  app.use('/api/health', healthRouter);

  return app;
}
