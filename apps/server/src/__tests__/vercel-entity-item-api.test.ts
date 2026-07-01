import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const env = {
  ALLOWED_GOOGLE_EMAIL: 'germanvelezh@gmail.com',
  GOOGLE_CLIENT_ID: 'client-id',
  GOOGLE_CLIENT_SECRET: 'client-secret',
  GOOGLE_REDIRECT_URI: 'https://app.example.com/auth/google/callback',
  PUBLIC_APP_URL: 'https://app.example.com',
  SESSION_SECRET: 'x'.repeat(32)
};

describe('Vercel entity item API route', () => {
  it('serves /api/:entity/:id as JSON instead of falling through to static 404', async () => {
    const previousEnv = { ...process.env };
    const routePath = fileURLToPath(new URL('../../api/[entity]/[id].ts', import.meta.url));

    expect(existsSync(routePath)).toBe(true);

    Object.assign(process.env, env);

    try {
      const { default: handler } = await import(routePath);
      let statusCode = 0;
      let jsonBody: unknown = null;
      const response = {
        json(body: unknown) {
          jsonBody = body;
        },
        status(code: number) {
          statusCode = code;
          return this;
        }
      };

      await handler(
        {
          headers: {},
          method: 'PUT',
          query: {
            entity: 'clients',
            id: 'CLI-20260624-C2HN'
          },
          url: '/api/clients/CLI-20260624-C2HN'
        },
        response
      );

      expect(statusCode).toBe(401);
      expect(jsonBody).toMatchObject({
        error: 'google_not_connected'
      });
    } finally {
      process.env = previousEnv;
    }
  });
});
