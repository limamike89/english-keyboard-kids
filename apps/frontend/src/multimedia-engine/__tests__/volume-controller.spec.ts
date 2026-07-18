import { describe, it, expect, vi } from 'vitest'
import { VolumeController } from '../audio/volume-controller'
import { EventBus } from '../core/event-bus'
import { createConfig } from '../config/multimedia.config'

function mockAudioContext() {
  return {
    createGain: () => ({
      gain: { value: 0, linearRampToValueAtTime: vi.fn(), setValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    }),
    destination: {},
    currentTime: 0,
  } as unknown as AudioContext
}

describe('VolumeController', () => {
  it('should initialize with default volumes', () => {
    const config = createConfig()
    const vc = new VolumeController(config)

    expect(vc.getMasterVolume()).toBe(0.8)
    expect(vc.getCategoryVolume('music')).toBe(0.6)
    expect(vc.getCategoryVolume('sfx')).toBe(1)
    expect(vc.getCategoryVolume('voice')).toBe(1)
  })

  it('should set master volume within bounds', () => {
    const vc = new VolumeController(createConfig())
    vc.setAudioContext(mockAudioContext())

    vc.setMasterVolume(0.5)
    expect(vc.getMasterVolume()).toBe(0.5)

    vc.setMasterVolume(1.5)
    expect(vc.getMasterVolume()).toBe(1)

    vc.setMasterVolume(-1)
    expect(vc.getMasterVolume()).toBe(0)
  })

  it('should set category volume within bounds', () => {
    const vc = new VolumeController(createConfig())
    vc.setAudioContext(mockAudioContext())

    vc.setCategoryVolume('music', 0.3)
    expect(vc.getCategoryVolume('music')).toBe(0.3)
  })

  it('should mute and unmute master', () => {
    const vc = new VolumeController(createConfig())
    vc.setAudioContext(mockAudioContext())

    expect(vc.isMuted()).toBe(false)
    vc.mute()
    expect(vc.isMuted()).toBe(true)
    vc.unmute()
    expect(vc.isMuted()).toBe(false)
  })

  it('should mute and unmute specific categories', () => {
    const vc = new VolumeController(createConfig())
    vc.setAudioContext(mockAudioContext())

    expect(vc.isMuted('music')).toBe(false)
    vc.mute('music')
    expect(vc.isMuted('music')).toBe(true)
    expect(vc.isMuted('sfx')).toBe(false)

    vc.unmute('music')
    expect(vc.isMuted('music')).toBe(false)
  })

  it('should emit events on volume change', () => {
    const bus = new EventBus()
    const handler = vi.fn()
    bus.on('VolumeChanged' as any, handler)

    const vc = new VolumeController(createConfig(), bus)
    vc.setAudioContext(mockAudioContext())
    vc.setMasterVolume(0.7)

    expect(handler).toHaveBeenCalled()
  })

  it('should emit events on mute change', () => {
    const bus = new EventBus()
    const handler = vi.fn()
    bus.on('MuteChanged' as any, handler)

    const vc = new VolumeController(createConfig(), bus)
    vc.setAudioContext(mockAudioContext())
    vc.mute()

    expect(handler).toHaveBeenCalled()
  })

  it('should return full volume state', () => {
    const vc = new VolumeController(createConfig())
    vc.setAudioContext(mockAudioContext())
    vc.mute('sfx')

    const state = vc.getState()
    expect(state.master).toBe(0.8)
    expect(state.mutedCategories.has('sfx')).toBe(true)
    expect(state.mutedCategories.has('music')).toBe(false)
  })

  it('should apply silent mode on muted category volume', () => {
    const vc = new VolumeController(createConfig())
    vc.setAudioContext(mockAudioContext())
    vc.mute('music')

    expect(vc.getCategoryVolume('music')).toBe(0)
    vc.unmute('music')
    expect(vc.getCategoryVolume('music')).toBe(0.6)
  })
})
