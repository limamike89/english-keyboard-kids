import type { MultimediaConfig, Language } from '../types'

export const DEFAULT_MULTIMEDIA_CONFIG: MultimediaConfig = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 1.0,
  voiceVolume: 1.0,
  uiVolume: 0.8,
  playbackRate: 1.0,
  language: 'en' as Language,
  voice: 'auto',
  animationsEnabled: true,
  silentMode: false,
  preloadConcurrency: 4,
  cacheMaxEntries: 50,
  cacheMaxAgeMs: 30 * 60 * 1000,
  memoryBudgetMb: 50,
  audioBufferPoolSize: 8,
  enableTTS: true,
}

export function createConfig(overrides?: Partial<MultimediaConfig>): MultimediaConfig {
  return { ...DEFAULT_MULTIMEDIA_CONFIG, ...overrides }
}
