export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function sanitizeString(value: string): string {
  return value.trim().toLowerCase();
}

export function generateSessionToken(): string {
  const { v4: uuidv4 } = require('uuid');
  return uuidv4();
}
