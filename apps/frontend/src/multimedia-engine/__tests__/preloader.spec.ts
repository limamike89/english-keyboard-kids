import { describe, it, expect, vi } from 'vitest'
import { Preloader } from '../core/preloader'
import { ResourceManager } from '../core/resource-manager'
import { CacheManager } from '../core/cache-manager'
import { EventBus } from '../core/event-bus'
import { ErrorHandler } from '../core/error-handler'
import { AudioResources } from '../resources/audio-resources'
import { ImageResources } from '../resources/image-resources'
import { ResourceLoader } from '../resources/resource-loader'
import { MultimediaEventType } from '../types'

function createPreloader() {
  const audioRegistry = new AudioResources()
  const imageRegistry = new ImageResources()
  const cache = new CacheManager(10, 60000, 50)
  const errorHandler = new ErrorHandler()
  const loader = new ResourceLoader(errorHandler, 4)
  const bus = new EventBus()

  audioRegistry.initialize()
  imageRegistry.initialize()

  const rm = new ResourceManager(audioRegistry, imageRegistry, cache, loader, bus)
  const preloader = new Preloader(rm, bus, errorHandler, 4)

  return { preloader, rm, bus, cache, loader, audioRegistry }
}

describe('Preloader', () => {
  it('should define preload phases', () => {
    const { preloader } = createPreloader()
    const phases = preloader.getPhases()
    expect(phases.length).toBe(3)
    expect(phases[0].label).toContain('Critical')
    expect(phases[1].label).toContain('Music')
    expect(phases[2].label).toContain('Voice')
  })

  it('should report not active initially', () => {
    const { preloader } = createPreloader()
    expect(preloader.isActive()).toBe(false)
  })

  it('should cancel preloading', () => {
    const { preloader } = createPreloader()
    preloader.cancel()
    expect(preloader.isActive()).toBe(false)
  })

  it('should set concurrency', () => {
    const { preloader } = createPreloader()
    preloader.setConcurrency(2)
  })

  it('should preload specific keys', async () => {
    const { preloader } = createPreloader()
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await preloader.preloadKeys(['missing-key-1', 'missing-key-2'])

    consoleSpy.mockRestore()
  })

  it('should emit preload phase events', async () => {
    const { preloader, bus } = createPreloader()
    const handler = vi.fn()
    bus.on(MultimediaEventType.PreloadPhaseStarted, handler)
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await preloader.preloadAll()

    expect(handler).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should emit completion event', async () => {
    const { preloader, bus } = createPreloader()
    const handler = vi.fn()
    bus.on(MultimediaEventType.AllResourcesLoaded, handler)
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await preloader.preloadAll()

    expect(handler).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should not run twice simultaneously', async () => {
    const { preloader } = createPreloader()
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const p1 = preloader.preloadAll()
    const p2 = preloader.preloadAll()

    await Promise.all([p1, p2])

    consoleSpy.mockRestore()
  })
})
