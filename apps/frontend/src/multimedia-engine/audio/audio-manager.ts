import type { AudioCategory, AudioPlayerState, MultimediaConfig, PlayAudioOptions } from '../types'
import { MultimediaEventType } from '../types'
import { type EventBus } from '../core/event-bus'
import { ErrorHandler } from '../core/error-handler'
import { VolumeController } from './volume-controller'
import { AudioPlayer } from './audio-player'
import { AudioPool } from './audio-pool'
import { SpeechSynthesizer } from './speech-synthesizer'
import { CacheManager } from '../core/cache-manager'
import { ResourceLoader } from '../resources/resource-loader'

export class AudioManager {
  private audioContext: AudioContext | null = null
  private volumeController: VolumeController
  private pool: AudioPool | null = null
  private speechSynthesizer: SpeechSynthesizer
  private cacheManager: CacheManager
  private resourceLoader: ResourceLoader
  private eventBus: EventBus
  private errorHandler: ErrorHandler
  private config: MultimediaConfig
  private initialized = false
  private activePlayers = new Map<string, AudioPlayer>()
  private duckingActive = false
  private previousMusicVolume = 0

  constructor(
    config: MultimediaConfig,
    cacheManager: CacheManager,
    resourceLoader: ResourceLoader,
    eventBus: EventBus,
    errorHandler: ErrorHandler,
    volumeController: VolumeController,
    speechSynthesizer: SpeechSynthesizer,
  ) {
    this.config = config
    this.cacheManager = cacheManager
    this.resourceLoader = resourceLoader
    this.eventBus = eventBus
    this.errorHandler = errorHandler
    this.volumeController = volumeController
    this.speechSynthesizer = speechSynthesizer
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      this.volumeController.setAudioContext(this.audioContext)

      const masterGain = this.volumeController.getMasterGain()
      if (!masterGain) throw new Error('Master gain node not initialized')

      this.pool = new AudioPool(
        this.audioContext,
        masterGain,
        this.config.audioBufferPoolSize,
        this.eventBus,
      )

      this.initialized = true
    } catch (error) {
      this.errorHandler.handleError({
        operation: 'AudioManager.initialize',
        error: error instanceof Error ? error : String(error),
      })
    }
  }

  isInitialized(): boolean {
    return this.initialized
  }

  async ensureContext(): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext
  }

  getVolumeController(): VolumeController {
    return this.volumeController
  }

  getSpeechSynthesizer(): SpeechSynthesizer {
    return this.speechSynthesizer
  }

  async playBuffer(
    buffer: AudioBuffer,
    key: string,
    category: AudioCategory,
    options: PlayAudioOptions = {},
  ): Promise<AudioPlayer | null> {
    await this.ensureContext()

    const categoryGain = this.volumeController.getCategoryGain(category)
    if (!categoryGain || !this.pool) return null

    const player = this.pool.acquire(category)
    player.load(buffer, key, category)

    if (options.duckMusic && category !== 'music') {
      this.duckMusic()
    }

    player.play(
      options.loop ?? false,
      options.rate ?? this.config.playbackRate,
      options.volume ?? this.volumeController.getCategoryVolume(category),
      options.fadeInMs ?? 0,
      () => {
        this.activePlayers.delete(key)
        this.pool?.release(player)
        if (options.duckMusic && category !== 'music') {
          this.unduckMusic()
        }
        options.onEnded?.()
      },
    )

    this.activePlayers.set(key, player)
    return player
  }

  async playUrl(
    url: string,
    key: string,
    category: AudioCategory,
    options: PlayAudioOptions = {},
  ): Promise<AudioPlayer | null> {
    const cached = this.cacheManager.get<AudioBuffer>(key)
    if (cached) {
      return this.playBuffer(cached, key, category, options)
    }

    const arrayBuffer = await this.resourceLoader.loadAudio(url, key)
    if (!arrayBuffer) return null

    try {
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer)
      this.cacheManager.set(key, audioBuffer, arrayBuffer.byteLength)
      this.eventBus.emit(MultimediaEventType.ResourceLoaded, { key, category })
      return this.playBuffer(audioBuffer, key, category, options)
    } catch (error) {
      this.errorHandler.handleError({
        operation: 'AudioManager.playUrl',
        resourceKey: key,
        category,
        error: error instanceof Error ? error : String(error),
      })
      return null
    }
  }

  async playTTS(text: string, options: PlayAudioOptions = {}): Promise<void> {
    await this.speechSynthesizer.speak(text, {
      rate: options.rate,
      lang: this.config.language,
    })
  }

  pauseAll(): void {
    for (const player of this.activePlayers.values()) {
      player.pause()
    }
  }

  resumeAll(): void {
    for (const player of this.activePlayers.values()) {
      player.resume()
    }
  }

  stopAll(): void {
    for (const player of this.activePlayers.values()) {
      player.stop()
    }
    this.activePlayers.clear()
    this.pool?.releaseAll()
    this.speechSynthesizer.stop()
  }

  stopByKey(key: string): void {
    const player = this.activePlayers.get(key)
    if (player) {
      player.stop()
      this.activePlayers.delete(key)
      this.pool?.release(player)
    }
  }

  stopByCategory(category: AudioCategory): void {
    for (const [key, player] of this.activePlayers.entries()) {
      if (player.category === category) {
        player.stop()
        this.activePlayers.delete(key)
        this.pool?.release(player)
      }
    }
  }

  getPlayerState(key: string): AudioPlayerState | null {
    const player = this.activePlayers.get(key)
    return player ? player.getState() : null
  }

  hasActivePlayer(key: string): boolean {
    return this.activePlayers.has(key)
  }

  getActiveCount(): number {
    return this.activePlayers.size
  }

  private duckMusic(): void {
    if (this.duckingActive) return
    this.duckingActive = true
    this.previousMusicVolume = this.volumeController.getCategoryVolume('music')
    this.volumeController.setCategoryVolume('music', this.previousMusicVolume * 0.3)
  }

  private unduckMusic(): void {
    if (!this.duckingActive) return
    this.duckingActive = false
    this.volumeController.setCategoryVolume('music', this.previousMusicVolume)
  }

  dispose(): void {
    this.stopAll()
    this.pool?.dispose()
    this.speechSynthesizer.stop()
    this.volumeController.dispose()
    if (this.audioContext) {
      this.audioContext.close().catch(() => {})
      this.audioContext = null
    }
    this.initialized = false
  }
}
