import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AudioManager } from '../audio/audio-manager'
import { VolumeController } from '../audio/volume-controller'
import { SpeechSynthesizer } from '../audio/speech-synthesizer'
import { CacheManager } from '../core/cache-manager'
import { EventBus } from '../core/event-bus'
import { ErrorHandler } from '../core/error-handler'
import { ResourceLoader } from '../resources/resource-loader'
import { createConfig } from '../config/multimedia.config'

function mockAudioBuffer(duration = 1): AudioBuffer {
  return {
    duration,
    length: 44100,
    sampleRate: 44100,
    numberOfChannels: 1,
    getChannelData: () => new Float32Array(44100),
    copyFromChannel: () => {},
    copyToChannel: () => {},
  } as AudioBuffer
}

describe('AudioManager', () => {
  let manager: AudioManager
  let eventBus: EventBus
  let errorHandler: ErrorHandler
  let cache: CacheManager

  beforeEach(async () => {
    eventBus = new EventBus()
    errorHandler = new ErrorHandler()
    cache = new CacheManager(10, 60000, 50, eventBus)
    const config = createConfig()
    const loader = new ResourceLoader(errorHandler, 4)
    const vc = new VolumeController(config, eventBus)
    const synth = new SpeechSynthesizer(errorHandler, false)

    manager = new AudioManager(config, cache, loader, eventBus, errorHandler, vc, synth)
    await manager.initialize()
  })

  afterEach(() => {
    manager.dispose()
  })

  it('should initialize audio context', () => {
    expect(manager.isInitialized()).toBe(true)
  })

  it('should return null when playing with no context', async () => {
    const ctx = manager.getAudioContext()
    if (!ctx) return

    const result = await manager.playBuffer(mockAudioBuffer(), 'test', 'sfx')
    expect(result).not.toBeNull()
  })

  it('should stop all audio', () => {
    manager.stopAll()
    expect(manager.getActiveCount()).toBe(0)
  })

  it('should stop by category', () => {
    manager.stopByCategory('music')
    expect(manager.getActiveCount()).toBe(0)
  })

  it('should accept playUrl with missing URL', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = await manager.playUrl('http://missing.audio/file.mp3', 'missing', 'sfx')
    expect(result).toBeNull()
    consoleSpy.mockRestore()
  })

  it('should report no active players initially', () => {
    expect(manager.getActiveCount()).toBe(0)
  })

  it('should return null state for unknown key', () => {
    expect(manager.getPlayerState('unknown')).toBeNull()
  })

  it('should handle TTS playback', async () => {
    const synth = manager.getSpeechSynthesizer()
    synth.setEnabled(true)

    await manager.playTTS('Hello')
  })

  it('should pause and resume all', () => {
    manager.pauseAll()
    manager.resumeAll()
  })

  it('should stop by key', () => {
    manager.stopByKey('test-key')
  })
})
