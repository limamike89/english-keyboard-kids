import { describe, it, expect, vi } from 'vitest'
import { EventBus } from '../core/event-bus'
import { MultimediaEventType } from '../types'

describe('EventBus', () => {
  it('should emit and receive events', () => {
    const bus = new EventBus()
    const handler = vi.fn()

    bus.on(MultimediaEventType.AudioStarted, handler)
    bus.emit(MultimediaEventType.AudioStarted, { key: 'test' })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: MultimediaEventType.AudioStarted,
        data: { key: 'test' },
      }),
    )
  })

  it('should not call unsubscribed handlers', () => {
    const bus = new EventBus()
    const handler = vi.fn()

    const unsubscribe = bus.on(MultimediaEventType.AudioFinished, handler)
    unsubscribe()
    bus.emit(MultimediaEventType.AudioFinished)

    expect(handler).not.toHaveBeenCalled()
  })

  it('should support onAny for all events', () => {
    const bus = new EventBus()
    const handler = vi.fn()

    bus.onAny(handler)
    bus.emit(MultimediaEventType.AudioStarted)
    bus.emit(MultimediaEventType.AudioFinished)

    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('should maintain event history', () => {
    const bus = new EventBus()
    bus.emit(MultimediaEventType.VolumeChanged, { value: 0.5 })
    bus.emit(MultimediaEventType.LanguageChanged, { language: 'es' })

    const history = bus.getHistory()
    expect(history).toHaveLength(2)
    expect(history[0].type).toBe(MultimediaEventType.VolumeChanged)
    expect(history[1].type).toBe(MultimediaEventType.LanguageChanged)
  })

  it('should clear history', () => {
    const bus = new EventBus()
    bus.emit(MultimediaEventType.AudioStarted)
    bus.clearHistory()
    expect(bus.getHistory()).toHaveLength(0)
  })

  it('should count listeners', () => {
    const bus = new EventBus()
    bus.on(MultimediaEventType.AudioStarted, () => {})
    bus.on(MultimediaEventType.AudioStarted, () => {})

    expect(bus.listenerCount(MultimediaEventType.AudioStarted)).toBe(2)
    expect(bus.listenerCount(MultimediaEventType.AudioFinished)).toBe(0)
  })

  it('should handle handler errors without crashing', () => {
    const bus = new EventBus()
    bus.on(MultimediaEventType.AudioStarted, () => { throw new Error('handler error') })
    bus.on(MultimediaEventType.AudioStarted, vi.fn())

    expect(() => bus.emit(MultimediaEventType.AudioStarted)).not.toThrow()
  })

  it('should remove all handlers', () => {
    const bus = new EventBus()
    const handler = vi.fn()
    bus.on(MultimediaEventType.AudioStarted, handler)
    bus.onAny(handler)
    bus.removeAll()
    bus.emit(MultimediaEventType.AudioStarted)

    expect(handler).not.toHaveBeenCalled()
  })

  it('should include timestamp in events', () => {
    const bus = new EventBus()
    const before = Date.now()
    bus.emit(MultimediaEventType.ResourceLoaded)
    const after = Date.now()
    const event = bus.getHistory()[0]

    expect(event.timestamp).toBeGreaterThanOrEqual(before)
    expect(event.timestamp).toBeLessThanOrEqual(after)
  })
})
