import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5174),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development')
});

export type ServerEnv = z.infer<typeof envSchema>;

export function getEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  return envSchema.parse(source);
}
