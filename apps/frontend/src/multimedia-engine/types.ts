export type Language = 'en' | 'es' | 'fr' | 'pt'
export type AudioCategory = 'music' | 'sfx' | 'voice' | 'ui'
export type AudioSubcategory = 'instructions' | 'feedback' | 'effects' | 'music' | 'content'
export type ResourceType = 'audio' | 'image' | 'animation'
export type GameMode = 'ALPHABET' | 'NUMBERS' | 'MIXED'

export enum MultimediaEventType {
  AudioStarted = 'AudioStarted',
  AudioFinished = 'AudioFinished',
  AudioPaused = 'AudioPaused',
  AudioResumed = 'AudioResumed',
  AudioStopped = 'AudioStopped',
  AudioFailed = 'AudioFailed',
  ResourceLoaded = 'ResourceLoaded',
  ResourceCached = 'ResourceCached',
  ResourceEvicted = 'ResourceEvicted',
  VolumeChanged = 'VolumeChanged',
  MuteChanged = 'MuteChanged',
  LanguageChanged = 'LanguageChanged',
  PlaybackRateChanged = 'PlaybackRateChanged',
  PreloadPhaseStarted = 'PreloadPhaseStarted',
  PreloadPhaseCompleted = 'PreloadPhaseCompleted',
  AnimationCompleted = 'AnimationCompleted',
  AllResourcesLoaded = 'AllResourcesLoaded',
}

export interface MultimediaConfig {
  masterVolume: number
  musicVolume: number
  sfxVolume: number
  voiceVolume: number
  uiVolume: number
  playbackRate: number
  language: Language
  voice: string
  animationsEnabled: boolean
  silentMode: boolean
  preloadConcurrency: number
  cacheMaxEntries: number
  cacheMaxAgeMs: number
  memoryBudgetMb: number
  audioBufferPoolSize: number
  enableTTS: boolean
}

export interface AudioResourceDefinition {
  key: string
  category: AudioCategory
  subcategory: AudioSubcategory
  path: string
  size?: number
}

export interface ImageResourceDefinition {
  key: string
  path: string
  width?: number
  height?: number
}

export interface CacheEntry<T = ArrayBuffer | Blob | HTMLImageElement> {
  data: T
  size: number
  lastAccessed: number
  accessCount: number
  loadedAt: number
}

export interface MultimediaEvent {
  type: MultimediaEventType
  timestamp: number
  data?: Record<string, unknown>
}

export interface PlayAudioOptions {
  category?: AudioCategory
  volume?: number
  rate?: number
  loop?: boolean
  fadeInMs?: number
  fadeOutMs?: number
  duckMusic?: boolean
  onEnded?: () => void
}

export interface AudioPlayerState {
  isPlaying: boolean
  isPaused: boolean
  currentTime: number
  duration: number
  volume: number
  rate: number
}

export interface PreloadPhase {
  id: number
  label: string
  resources: string[]
}

export interface PreloadProgress {
  phase: number
  totalPhases: number
  loaded: number
  total: number
  percentage: number
}

export type EventHandler = (event: MultimediaEvent) => void

export interface VolumeState {
  master: number
  music: number
  sfx: number
  voice: number
  ui: number
  muted: boolean
  mutedCategories: Set<AudioCategory>
}
