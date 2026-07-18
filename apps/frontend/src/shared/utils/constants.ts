export const STORAGE_KEYS = {
  SESSION_TOKEN: 'session-token',
} as const

export const API_ENDPOINTS = {
  SESSIONS: '/sessions',
  LESSONS: '/lessons',
  GAME: '/game',
  AUDIO: '/audio',
  PROGRESS: '/progress',
  STATS: '/stats',
  ANALYTICS: '/analytics',
} as const

export const ROUTES = {
  HOME: '/',
  LESSONS: '/lessons',
  GAME: '/game',
  RESULTS: '/results',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  ANALYTICS: '/analytics',
  PARENT_LOGIN: '/parent/login',
  PARENT_REGISTER: '/parent/register',
  PARENT_DASHBOARD: '/parent/dashboard',
} as const
