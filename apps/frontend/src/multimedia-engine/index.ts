export { MultimediaEngine } from './core/multimedia-engine'
export type { MultimediaEngineOptions } from './core/multimedia-engine'
export { EventBus } from './core/event-bus'
export { ErrorHandler } from './core/error-handler'
export { CacheManager } from './core/cache-manager'
export { ResourceManager } from './core/resource-manager'
export { Preloader } from './core/preloader'
export { AudioPlayer, AudioPool, AudioManager, VolumeController, SpeechSynthesizer } from './audio'
export type { SpeechOptions } from './audio'
export { ImageManager, AnimationController } from './visuals'
export type { AnimationType } from './visuals'
export { ResourceLoader, AudioResources, audioResources, ImageResources, imageResources } from './resources'
export { AudioLocalization, audioLocalization, VoiceRegistry, voiceRegistry } from './i18n'
export { MultimediaProvider, useMultimedia, useAudio, useFeedbackAudio } from './react'

export { createConfig, DEFAULT_MULTIMEDIA_CONFIG, LANGUAGE_VOICE_CONFIG, getLanguageConfig, isLanguageSupported } from './config'
export type { LanguageVoiceConfig } from './config'

export {
  MultimediaEventType,
} from './types'
export type {
  Language,
  AudioCategory,
  AudioSubcategory,
  ResourceType,
  GameMode,
  MultimediaConfig,
  AudioResourceDefinition,
  ImageResourceDefinition,
  CacheEntry,
  MultimediaEvent,
  PlayAudioOptions,
  AudioPlayerState,
  PreloadPhase,
  PreloadProgress,
  VolumeState,
} from './types'
