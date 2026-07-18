import type {
  MultimediaConfig,
  AudioCategory,
  AudioPlayerState,
  Language,
  PlayAudioOptions,
  PreloadProgress,
  VolumeState,
} from '../types'
import { MultimediaEventType } from '../types'
import { EventBus } from './event-bus'
import { ErrorHandler, type LogLevel } from './error-handler'
import { CacheManager } from './cache-manager'
import { ResourceManager } from './resource-manager'
import { Preloader } from './preloader'
import { AudioManager } from '../audio/audio-manager'
import { VolumeController } from '../audio/volume-controller'
import { SpeechSynthesizer } from '../audio/speech-synthesizer'
import { ImageManager } from '../visuals/image-manager'
import { AnimationController } from '../visuals/animation-controller'
import { ResourceLoader } from '../resources/resource-loader'
import { AudioResources, audioResources } from '../resources/audio-resources'
import { ImageResources, imageResources } from '../resources/image-resources'
import { AudioLocalization, audioLocalization } from '../i18n/audio-localization'
import { VoiceRegistry, voiceRegistry } from '../i18n/voice-registry'
import { createConfig } from '../config/multimedia.config'
import { getLanguageConfig } from '../config/language.config'

export interface MultimediaEngineOptions {
  config?: Partial<MultimediaConfig>
  eventBus?: EventBus
}

export class MultimediaEngine {
  readonly eventBus: EventBus
  readonly errorHandler: ErrorHandler
  readonly cacheManager: CacheManager
  readonly resourceLoader: ResourceLoader
  readonly resourceManager: ResourceManager
  readonly audioManager: AudioManager
  readonly volumeController: VolumeController
  readonly speechSynthesizer: SpeechSynthesizer
  readonly imageManager: ImageManager
  readonly animationController: AnimationController
  readonly preloader: Preloader
  readonly audioLocalization: AudioLocalization
  readonly audioRegistry: AudioResources
  readonly imageRegistry: ImageResources
  readonly voiceRegistry: VoiceRegistry

  config: MultimediaConfig

  private initialized = false

  private getGameContentText(key: string): string | null {
    const letter = /^en-letter-([a-z])$/i.exec(key)
    if (letter) return letter[1]

    const number = /^en-number-([0-9])$/.exec(key)
    if (!number) return null

    return ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][Number(number[1])]
  }

  private resolveCategory(key: string): AudioCategory {
    const def = this.audioRegistry.get(key)
    return def?.category ?? 'sfx'
  }

  constructor(options: MultimediaEngineOptions = {}) {
    this.config = createConfig(options.config)
    this.eventBus = options.eventBus ?? new EventBus()
    this.errorHandler = new ErrorHandler()
    this.cacheManager = new CacheManager(
      this.config.cacheMaxEntries,
      this.config.cacheMaxAgeMs,
      this.config.memoryBudgetMb,
      this.eventBus,
    )
    this.resourceLoader = new ResourceLoader(this.errorHandler, this.config.preloadConcurrency)
    this.volumeController = new VolumeController(this.config, this.eventBus)
    this.speechSynthesizer = new SpeechSynthesizer(this.errorHandler, this.config.enableTTS)
    this.audioManager = new AudioManager(
      this.config,
      this.cacheManager,
      this.resourceLoader,
      this.eventBus,
      this.errorHandler,
      this.volumeController,
      this.speechSynthesizer,
    )
    this.audioRegistry = audioResources
    this.imageRegistry = imageResources
    this.resourceManager = new ResourceManager(
      this.audioRegistry,
      this.imageRegistry,
      this.cacheManager,
      this.resourceLoader,
      this.eventBus,
    )
    this.imageManager = new ImageManager(this.resourceManager)
    this.animationController = new AnimationController(this.eventBus, this.config)
    this.preloader = new Preloader(
      this.resourceManager,
      this.eventBus,
      this.errorHandler,
      this.config.preloadConcurrency,
    )
    this.audioLocalization = audioLocalization
    this.voiceRegistry = voiceRegistry
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    this.audioRegistry.initialize()
    this.imageRegistry.initialize()
    await this.voiceRegistry.initialize()
    await this.audioManager.initialize()
    this.initialized = true

    this.eventBus.emit(MultimediaEventType.ResourceLoaded, { type: 'engine', status: 'initialized' })
  }

  isReady(): boolean {
    return this.initialized
  }

  async playAudio(key: string, options: PlayAudioOptions = {}): Promise<void> {
    const gameContentText = this.getGameContentText(key)
    if (gameContentText && this.config.enableTTS) {
      try {
        await this.audioManager.playTTS(gameContentText, options)
        options.onEnded?.()
        return
      } catch {
        // TTS failed (e.g. browser autoplay policy), fall back to audio file
      }
    }

    const path = this.resourceManager.getAudioPath(key)
    if (!path) {
      this.errorHandler.handleError({
        operation: 'playAudio',
        resourceKey: key,
        error: new Error(`Audio resource not found: ${key}`),
      })
      return
    }

    const category = options.category ?? this.resolveCategory(key)
    await this.audioManager.playUrl(path, key, category, options)
  }

  async playFeedback(key: string): Promise<void> {
    const text = this.audioLocalization.getFeedback(key)

    if (this.config.enableTTS) {
      await this.audioManager.playTTS(text, { duckMusic: true })
      return
    }

    if (this.audioRegistry.has(key)) {
      await this.playAudio(key, { category: 'voice', duckMusic: true })
    }
  }

  async playInstruction(key: string, params?: Record<string, string>): Promise<void> {
    const text = this.audioLocalization.getInstruction(key, params)

    if (this.config.enableTTS) {
      await this.audioManager.playTTS(text, { duckMusic: true })
      return
    }

    if (this.audioRegistry.has(key)) {
      await this.playAudio(key, { category: 'voice', duckMusic: true })
    }
  }

  async playEffect(key: string): Promise<void> {
    const effectKey = key.startsWith('effect-') ? key.replace('effect-', '') : key
    await this.playAudio(effectKey, { category: 'sfx' })
  }

  async playMusic(key: string, loop = true, fadeIn = 500): Promise<void> {
    await this.playAudio(key, { category: 'music', loop, fadeInMs: fadeIn })
  }

  stopAudio(key?: string): void {
    if (key) {
      this.audioManager.stopByKey(key)
    } else {
      this.audioManager.stopAll()
    }
  }

  stopMusic(): void {
    this.audioManager.stopByCategory('music')
  }

  stopEffects(): void {
    this.audioManager.stopByCategory('sfx')
  }

  pauseAll(): void {
    this.audioManager.pauseAll()
  }

  resumeAll(): void {
    this.audioManager.resumeAll()
  }

  setVolume(category: AudioCategory | 'master', value: number): void {
    if (category === 'master') {
      this.volumeController.setMasterVolume(value)
    } else {
      this.volumeController.setCategoryVolume(category, value)
    }
  }

  getVolume(category: AudioCategory | 'master'): number {
    if (category === 'master') return this.volumeController.getMasterVolume()
    return this.volumeController.getCategoryVolume(category)
  }

  getVolumeState(): VolumeState {
    return this.volumeController.getState()
  }

  mute(category?: AudioCategory): void {
    this.volumeController.mute(category)
  }

  unmute(category?: AudioCategory): void {
    this.volumeController.unmute(category)
  }

  isMuted(category?: AudioCategory): boolean {
    return this.volumeController.isMuted(category)
  }

  setLanguage(lang: Language): void {
    this.config.language = lang
    this.resourceManager.setLanguage(lang)
    this.audioLocalization.setLanguage(lang)

    const config = getLanguageConfig(lang)
    this.config.voice = config.voicePrefix

    this.eventBus.emit(MultimediaEventType.LanguageChanged, {
      language: lang,
      voice: this.config.voice,
    })
  }

  getLanguage(): Language {
    return this.config.language
  }

  setPlaybackRate(rate: number): void {
    this.config.playbackRate = Math.max(0.1, Math.min(3, rate))
    this.eventBus.emit(MultimediaEventType.PlaybackRateChanged, { rate: this.config.playbackRate })
  }

  async preloadAll(onProgress?: (progress: PreloadProgress) => void): Promise<void> {
    await this.preloader.preloadAll(onProgress)
  }

  async preloadPredictive(currentKey: string, mode: string): Promise<void> {
    await this.preloader.preloadPredictive(currentKey, mode)
  }

  speak(text: string, options?: PlayAudioOptions): Promise<void> {
    return this.audioManager.playTTS(text, options)
  }

  getAudioState(key: string): AudioPlayerState | null {
    return this.audioManager.getPlayerState(key)
  }

  getCacheStats() {
    return this.cacheManager.getStats()
  }

  setLogLevel(level: LogLevel): void {
    this.errorHandler.setLogLevel(level)
  }

  setSilentMode(enabled: boolean): void {
    this.config.silentMode = enabled
    if (enabled) {
      this.volumeController.mute()
    } else {
      this.volumeController.unmute()
    }
  }

  isInSilentMode(): boolean {
    return this.config.silentMode
  }

  updateConfig(partial: Partial<MultimediaConfig>): void {
    Object.assign(this.config, partial)
    if (partial.masterVolume !== undefined) {
      this.volumeController.setMasterVolume(partial.masterVolume)
    }
    if (partial.silentMode !== undefined) {
      this.setSilentMode(partial.silentMode)
    }
    if (partial.language !== undefined) {
      this.setLanguage(partial.language)
    }
  }

  dispose(): void {
    this.audioManager.dispose()
    this.preloader.cancel()
    this.cacheManager.clear()
    this.eventBus.removeAll()
    this.initialized = false
  }
}
