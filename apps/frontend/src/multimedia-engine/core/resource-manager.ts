import type { AudioResourceDefinition, ImageResourceDefinition, Language } from '../types'
import { MultimediaEventType } from '../types'
import { type EventBus } from './event-bus'
import { CacheManager } from './cache-manager'
import { ResourceLoader } from '../resources/resource-loader'
import { AudioResources } from '../resources/audio-resources'
import { ImageResources } from '../resources/image-resources'

export class ResourceManager {
  private audioRegistry: AudioResources
  private imageRegistry: ImageResources
  private cacheManager: CacheManager
  private resourceLoader: ResourceLoader
  private eventBus: EventBus | null = null
  private currentLanguage: Language = 'en'

  constructor(
    audioRegistry: AudioResources,
    imageRegistry: ImageResources,
    cacheManager: CacheManager,
    resourceLoader: ResourceLoader,
    eventBus?: EventBus,
  ) {
    this.audioRegistry = audioRegistry
    this.imageRegistry = imageRegistry
    this.cacheManager = cacheManager
    this.resourceLoader = resourceLoader
    this.eventBus = eventBus ?? null
  }

  setLanguage(lang: Language): void {
    this.currentLanguage = lang
  }

  getLanguage(): Language {
    return this.currentLanguage
  }

  getAudioPath(key: string): string | null {
    const resource = this.audioRegistry.get(key)
    if (!resource) return null

    if (resource.subcategory === 'instructions' || resource.subcategory === 'feedback') {
      return resource.path.replace('{lang}', this.currentLanguage)
    }

    return resource.path
  }

  getAudioDefinition(key: string): AudioResourceDefinition | undefined {
    return this.audioRegistry.get(key)
  }

  getImagePath(key: string): string | null {
    const resource = this.imageRegistry.get(key)
    return resource?.path ?? null
  }

  hasAudio(key: string): boolean {
    return this.audioRegistry.has(key)
  }

  hasImage(key: string): boolean {
    return this.imageRegistry.has(key)
  }

  getAllAudioKeys(): string[] {
    return this.audioRegistry.getKeys()
  }

  getAllAudioByCategory(category: string): AudioResourceDefinition[] {
    return this.audioRegistry.getByCategory(category)
  }

  getAllAudioBySubcategory(subcategory: string): AudioResourceDefinition[] {
    return this.audioRegistry.getBySubcategory(subcategory)
  }

  getAllImageKeys(): string[] {
    return this.imageRegistry.getAll().map((r) => r.key)
  }

  async loadAudioBuffer(key: string): Promise<AudioBuffer | null> {
    const cached = this.cacheManager.get<AudioBuffer>(key)
    if (cached) return cached

    const path = this.getAudioPath(key)
    if (!path) return null

    const arrayBuffer = await this.resourceLoader.loadAudio(path, key)
    if (!arrayBuffer) return null

    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      audioContext.close()
      this.cacheManager.set(key, audioBuffer, arrayBuffer.byteLength)
      this.eventBus?.emit(MultimediaEventType.ResourceLoaded, { key, type: 'audio' })
      return audioBuffer
    } catch {
      return null
    }
  }

  async loadImage(key: string): Promise<HTMLImageElement | null> {
    const cached = this.cacheManager.get<HTMLImageElement>(key)
    if (cached) return cached

    const path = this.getImagePath(key)
    if (!path) return null

    const img = await this.resourceLoader.loadImage(path, key)
    if (img) {
      this.cacheManager.set(key, img, 0)
      this.eventBus?.emit(MultimediaEventType.ResourceLoaded, { key, type: 'image' })
    }
    return img
  }

  isAudioCached(key: string): boolean {
    return this.cacheManager.has(key)
  }

  registerAudio(def: AudioResourceDefinition): void {
    this.audioRegistry.registerCustom(def)
  }

  registerImage(def: ImageResourceDefinition): void {
    this.imageRegistry.registerCustom(def)
  }

  setEventBus(eventBus: EventBus): void {
    this.eventBus = eventBus
  }

  getCacheStats() {
    return this.cacheManager.getStats()
  }
}
