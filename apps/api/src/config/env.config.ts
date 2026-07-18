import { Logger } from '@nestjs/common';
import { envSchema, type Env } from './env.schema';

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    Logger.error('Environment validation failed:', JSON.stringify(errors, null, 2));
    throw new Error(`Environment validation failed: ${JSON.stringify(errors)}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export function getEnvValue<K extends keyof Env>(key: K): Env[K] {
  return getEnv()[key];
}
