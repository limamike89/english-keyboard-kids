import type { AudioCategory } from '../types'
import { AudioPlayer } from './audio-player'
import { EventBus } from '../core/event-bus'

interface PoolEntry {
  player: AudioPlayer
  inUse: boolean
  category: AudioCategory
  lastUsed: number
}

export class AudioPool {
  private pool: PoolEntry[] = []
  private audioContext: AudioContext
  private destination: AudioNode
  private maxSize: number
  private eventBus: EventBus | null

  constructor(
    audioContext: AudioContext,
    destination: AudioNode,
    maxSize = 8,
    eventBus?: EventBus,
  ) {
    this.audioContext = audioContext
    this.destination = destination
    this.maxSize = maxSize
    this.eventBus = eventBus ?? null
  }

  acquire(category: AudioCategory): AudioPlayer {
    const available = this.pool.find(
      (e) => !e.inUse && e.category === category,
    )

    if (available) {
      available.inUse = true
      available.lastUsed = Date.now()
      return available.player
    }

    if (this.pool.length < this.maxSize) {
      const player = new AudioPlayer(
        this.audioContext,
        this.destination,
        this.eventBus ?? undefined,
      )
      this.pool.push({
        player,
        inUse: true,
        category,
        lastUsed: Date.now(),
      })
      return player
    }

    const oldest = this.pool.reduce((a, b) =>
      a.lastUsed < b.lastUsed ? a : b,
    )
    oldest.player.stop()
    oldest.inUse = true
    oldest.category = category
    oldest.lastUsed = Date.now()
    return oldest.player
  }

  release(player: AudioPlayer): void {
    const entry = this.pool.find((e) => e.player === player)
    if (entry) {
      entry.inUse = false
      entry.lastUsed = Date.now()
    }
  }

  releaseAll(): void {
    for (const entry of this.pool) {
      entry.inUse = false
      entry.player.stop()
    }
  }

  getActiveCount(): number {
    return this.pool.filter((e) => e.inUse).length
  }

  getPoolSize(): number {
    return this.pool.length
  }

  dispose(): void {
    for (const entry of this.pool) {
      entry.player.dispose()
    }
    this.pool = []
  }
}
