import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().positive().max(65535).default(4000),
  HOST: z.string().default('0.0.0.0'),
  API_PREFIX: z.string().default('api/v1'),
  CORS_ORIGINS: z.string().default('*'),

  DATABASE_URL: z.string().url(),

  REDIS_URL: z.string().url().optional(),

  JWT_SECRET: z.string().min(16).default('dev-secret-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SESSION_TOKEN_EXPIRES_IN: z.string().default('30d'),

  AUDIO_STORAGE: z.enum(['local', 's3']).default('local'),
  AUDIO_PATH: z.string().default('./public/audio'),

  SWAGGER_ENABLED: z
    .string()
    .transform((v) => v === 'true' || v === '1')
    .default('true'),
  SWAGGER_PATH: z.string().default('docs'),

  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  RATE_LIMIT_TTL: z.coerce.number().positive().default(60),
  RATE_LIMIT_MAX: z.coerce.number().positive().default(100),
});

export type Env = z.infer<typeof envSchema>;
