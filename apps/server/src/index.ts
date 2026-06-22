import 'dotenv/config';

import { createApp } from './app.js';
import { getEnv } from './config/env.js';

const env = getEnv();
const app = createApp();

app.listen(env.PORT, '127.0.0.1', () => {
  console.log(`Startup OS server listening on http://127.0.0.1:${env.PORT}`);
});
