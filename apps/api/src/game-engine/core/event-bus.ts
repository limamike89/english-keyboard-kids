import { GameEvent, GameEventType, EventHandler } from './types'

export class EventBus {
  private listeners = new Map<GameEventType, EventHandler[]>()
  private history: GameEvent[] = []

  on(eventType: GameEventType, handler: EventHandler): void {
    const handlers = this.listeners.get(eventType) ?? []
    handlers.push(handler)
    this.listeners.set(eventType, handlers)
  }

  off(eventType: GameEventType, handler: EventHandler): void {
    const handlers = this.listeners.get(eventType)
    if (!handlers) return
    this.listeners.set(
      eventType,
      handlers.filter((h) => h !== handler),
    )
  }

  emit(type: GameEventType, payload?: Record<string, unknown>): void {
    const event: GameEvent = { type, timestamp: new Date(), payload }
    this.history.push(event)

    const handlers = this.listeners.get(type)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event)
        } catch {
        }
      })
    }
  }

  getHistory(): GameEvent[] {
    return [...this.history]
  }

  clear(): void {
    this.listeners.clear()
    this.history = []
  }
}
