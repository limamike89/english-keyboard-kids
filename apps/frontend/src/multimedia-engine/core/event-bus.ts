import { MultimediaEventType, type MultimediaEvent, type EventHandler } from '../types'

const MAX_HISTORY = 100

export class EventBus {
  private handlers = new Map<MultimediaEventType, Set<EventHandler>>()
  private history: MultimediaEvent[] = []
  private globalHandlers = new Set<EventHandler>()

  on(eventType: MultimediaEventType, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }
    this.handlers.get(eventType)!.add(handler)

    return () => {
      this.handlers.get(eventType)?.delete(handler)
    }
  }

  onAny(handler: EventHandler): () => void {
    this.globalHandlers.add(handler)
    return () => {
      this.globalHandlers.delete(handler)
    }
  }

  emit(type: MultimediaEventType, data?: Record<string, unknown>): void {
    const event: MultimediaEvent = {
      type,
      timestamp: Date.now(),
      data,
    }

    this.history.push(event)
    if (this.history.length > MAX_HISTORY) {
      this.history.shift()
    }

    const specific = this.handlers.get(type)
    if (specific) {
      specific.forEach((h) => {
        try {
          h(event)
        } catch { /* handler error */ }
      })
    }

    this.globalHandlers.forEach((h) => {
      try {
        h(event)
      } catch { /* handler error */ }
    })
  }

  getHistory(): ReadonlyArray<MultimediaEvent> {
    return this.history
  }

  clearHistory(): void {
    this.history = []
  }

  removeAll(): void {
    this.handlers.clear()
    this.globalHandlers.clear()
  }

  listenerCount(eventType: MultimediaEventType): number {
    return this.handlers.get(eventType)?.size ?? 0
  }
}
