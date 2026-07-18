import { EventBus } from '../core/event-bus'
import { GameEventType } from '../core/types'

describe('EventBus', () => {
  it('should emit and receive events', () => {
    const bus = new EventBus()
    const handler = jest.fn()
    bus.on(GameEventType.GameStarted, handler)
    bus.emit(GameEventType.GameStarted, { sessionId: '123' })
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GameEventType.GameStarted,
        payload: { sessionId: '123' },
      }),
    )
  })

  it('should not call handler after off()', () => {
    const bus = new EventBus()
    const handler = jest.fn()
    bus.on(GameEventType.GameStarted, handler)
    bus.off(GameEventType.GameStarted, handler)
    bus.emit(GameEventType.GameStarted)
    expect(handler).not.toHaveBeenCalled()
  })

  it('should track event history', () => {
    const bus = new EventBus()
    bus.emit(GameEventType.GameStarted)
    bus.emit(GameEventType.GameFinished)
    expect(bus.getHistory()).toHaveLength(2)
  })

  it('should handle multiple handlers', () => {
    const bus = new EventBus()
    const h1 = jest.fn()
    const h2 = jest.fn()
    bus.on(GameEventType.GameStarted, h1)
    bus.on(GameEventType.GameStarted, h2)
    bus.emit(GameEventType.GameStarted)
    expect(h1).toHaveBeenCalledTimes(1)
    expect(h2).toHaveBeenCalledTimes(1)
  })

  it('should survive handler throwing', () => {
    const bus = new EventBus()
    bus.on(GameEventType.GameStarted, () => { throw new Error('oops') })
    expect(() => bus.emit(GameEventType.GameStarted)).not.toThrow()
  })

  it('should clear listeners but keep new events', () => {
    const bus = new EventBus()
    const handler = jest.fn()
    bus.on(GameEventType.GameStarted, handler)
    bus.emit(GameEventType.GameStarted)
    bus.clear()
    bus.emit(GameEventType.GameStarted)
    expect(handler).toHaveBeenCalledTimes(1)
    expect(bus.getHistory()).toHaveLength(1)
  })
})
