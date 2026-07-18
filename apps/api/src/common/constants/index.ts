export const APP_NAME = 'English Keyboard Kids API';
export const APP_VERSION = '1.0.0';

export const SESSION_TOKEN_HEADER = 'x-session-token';
export const IDEMPOTENCY_KEY_HEADER = 'idempotency-key';
export const REQUEST_ID_HEADER = 'x-request-id';

export const RATE_LIMIT = {
  GENERAL: { windowMs: 60_000, max: 100 },
  GAME_SUBMIT: { windowMs: 60_000, max: 30 },
  AUDIO: { windowMs: 60_000, max: 60 },
} as const;

export const GAME_CONFIG = {
  POINTS_FIRST_TRY: 10,
  POINTS_SECOND_TRY: 5,
  POINTS_THIRD_TRY_PLUS: 2,
  STREAK_BONUS: 3,
  STREAK_BONUS_EVERY: 5,
  FEEDBACK_DELAY_CORRECT_MS: 1500,
  FEEDBACK_DELAY_INCORRECT_MS: 1000,
  MAX_ATTEMPTS: 999,
} as const;
