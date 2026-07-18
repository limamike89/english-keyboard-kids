import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MultimediaEngine } from '../core/multimedia-engine'
import { MultimediaEventType } from '../types'

describe('MultimediaEngine Integration', () => {
  let engine: MultimediaEngine

  beforeEach(async () => {
    engine = new MultimediaEngine({
      config: { enableTTS: false },
    })
    await engine.initialize()
  })

  afterEach(() => {
    engine.dispose()
  })

  it('should initialize and be ready', () => {
    expect(engine.isReady()).toBe(true)
  })

  it('should have registered audio resources', () => {
    expect(engine.audioRegistry.getKeys().length).toBeGreaterThan(0)
  })

  it('should have registered image resources', () => {
    expect(engine.imageRegistry.getAll().length).toBeGreaterThan(0)
  })

  it('should set and get volume', () => {
    engine.setVolume('master', 0.5)
    expect(engine.getVolume('master')).toBe(0.5)
  })

  it('should set volume by category', () => {
    engine.setVolume('music', 0.3)
    expect(engine.getVolume('music')).toBe(0.3)
  })

  it('should mute and unmute', () => {
    expect(engine.isMuted()).toBe(false)
    engine.mute()
    expect(engine.isMuted()).toBe(true)
    engine.unmute()
    expect(engine.isMuted()).toBe(false)
  })

  it('should mute specific category', () => {
    engine.mute('music')
    expect(engine.isMuted('music')).toBe(true)
    expect(engine.isMuted()).toBe(false)
  })

  it('should set and get language', () => {
    engine.setLanguage('es')
    expect(engine.getLanguage()).toBe('es')
  })

  it('should emit LanguageChanged event', () => {
    const handler = vi.fn()
    engine.eventBus.on(MultimediaEventType.LanguageChanged, handler)
    engine.setLanguage('fr')

    expect(handler).toHaveBeenCalled()
    expect(handler.mock.calls[0][0].data?.language).toBe('fr')
  })

  it('should set playback rate', () => {
    engine.setPlaybackRate(1.5)
    expect(engine.config.playbackRate).toBe(1.5)
  })

  it('should set silent mode', () => {
    engine.setSilentMode(true)
    expect(engine.isInSilentMode()).toBe(true)
    engine.setSilentMode(false)
    expect(engine.isInSilentMode()).toBe(false)
  })

  it('should handle playing unknown audio gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await engine.playAudio('nonexistent-resource')
    consoleSpy.mockRestore()
  })

  it('should use speech synthesis for game letters when TTS is enabled', async () => {
    const ttsEngine = new MultimediaEngine({ config: { enableTTS: true } })
    await ttsEngine.initialize()
    const playTTS = vi.spyOn(ttsEngine.audioManager, 'playTTS').mockResolvedValue()

    await ttsEngine.playAudio('en-letter-q')

    expect(playTTS).toHaveBeenCalledWith('q', {})
    ttsEngine.dispose()
  })

  it('should use speech synthesis for feedback when TTS is enabled', async () => {
    const ttsEngine = new MultimediaEngine({ config: { enableTTS: true } })
    await ttsEngine.initialize()
    const playTTS = vi.spyOn(ttsEngine.audioManager, 'playTTS').mockResolvedValue()

    await ttsEngine.playFeedback('correct')

    expect(playTTS).toHaveBeenCalledWith('Correct!', { duckMusic: true })
    ttsEngine.dispose()
  })

  it('should handle feedback playback gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await engine.playFeedback('correct')
    consoleSpy.mockRestore()
  })

  it('should handle effects playback gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await engine.playEffect('click')
    consoleSpy.mockRestore()
  })

  it('should stop music', () => {
    engine.stopMusic()
  })

  it('should stop effects', () => {
    engine.stopEffects()
  })

  it('should pause and resume all', () => {
    engine.pauseAll()
    engine.resumeAll()
  })

  it('should return volume state', () => {
    const state = engine.getVolumeState()
    expect(state).toHaveProperty('master')
    expect(state).toHaveProperty('muted')
  })

  it('should update config partially', () => {
    engine.updateConfig({ masterVolume: 0.3, language: 'es' })
    expect(engine.config.masterVolume).toBe(0.3)
    expect(engine.getLanguage()).toBe('es')
  })

  it('should get cache stats', () => {
    const stats = engine.getCacheStats()
    expect(stats).toHaveProperty('hits')
    expect(stats).toHaveProperty('hitRate')
  })

  it('should preload all with progress', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const progressFn = vi.fn()
    await engine.preloadAll(progressFn)
    consoleSpy.mockRestore()
  })

  it('should speak via TTS', async () => {
    await engine.speak('Hello')
  })

  it('should set log level', () => {
    engine.setLogLevel('error')
  })

  it('should handle preload predictive', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await engine.preloadPredictive('correct', 'ALPHABET')
    consoleSpy.mockRestore()
  })

  it('should handle instruction text correctly', () => {
    const text = engine.audioLocalization.getInstruction('press-first-letter', { word: 'Apple' })
    expect(text).toContain('Apple')
  })

  it('should get audio state for nonexistent key', () => {
    expect(engine.getAudioState('nonexistent')).toBeNull()
  })

  it('should dispose cleanly', () => {
    engine.dispose()
    expect(engine.isReady()).toBe(false)
  })
})
