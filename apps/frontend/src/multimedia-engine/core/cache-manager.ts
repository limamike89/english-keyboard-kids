import type { CacheEntry } from '../types'
import { MultimediaEventType } from '../types'
import { type EventBus } from './event-bus'

interface CacheStats {
  hits: number
  misses: number
  entries: number
  estimatedSizeBytes: number
  hitRate: number
}

export class CacheManager {
  private cache = new Map<string, CacheEntry>()
  private maxEntries: number
  private maxAgeMs: number
  private memoryBudgetBytes: number
  private estimatedBytes = 0
  private hits = 0
  private misses = 0
  private eventBus: EventBus | null = null

  constructor(
    maxEntries = 50,
    maxAgeMs = 30 * 60 * 1000,
    memoryBudgetMb = 50,
    eventBus?: EventBus,
  ) {
    this.maxEntries = maxEntries
    this.maxAgeMs = maxAgeMs
    this.memoryBudgetBytes = memoryBudgetMb * 1024 * 1024
    this.eventBus = eventBus ?? null
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      this.misses++
      return null
    }

    if (Date.now() - entry.lastAccessed > this.maxAgeMs) {
      this.cache.delete(key)
      this.estimatedBytes -= entry.size
      this.misses++
      return null
    }

    this.hits++
    entry.lastAccessed = Date.now()
    entry.accessCount++
    return entry.data as T
  }

  set<T>(key: string, data: T, size: number): void {
    this.evictIfNeeded(size)

    const entry: CacheEntry<T> = {
      data,
      size,
      lastAccessed: Date.now(),
      accessCount: 1,
      loadedAt: Date.now(),
    }

    this.cache.set(key, entry as CacheEntry)
    this.estimatedBytes += size

    this.eventBus?.emit(MultimediaEventType.ResourceCached, {
      key,
      size,
      cacheSize: this.estimatedBytes,
    })
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    if (Date.now() - entry.lastAccessed > this.maxAgeMs) {
      this.cache.delete(key)
      this.estimatedBytes -= entry.size
      return false
    }
    return true
  }

  delete(key: string): void {
    const entry = this.cache.get(key)
    if (entry) {
      this.estimatedBytes -= entry.size
      this.cache.delete(key)
      this.eventBus?.emit(MultimediaEventType.ResourceEvicted, { key })
    }
  }

  clear(): void {
    this.cache.clear()
    this.estimatedBytes = 0
    this.hits = 0
    this.misses = 0
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses
    return {
      hits: this.hits,
      misses: this.misses,
      entries: this.cache.size,
      estimatedSizeBytes: this.estimatedBytes,
      hitRate: total > 0 ? this.hits / total : 0,
    }
  }

  setEventBus(eventBus: EventBus): void {
    this.eventBus = eventBus
  }

  getCacheSize(): number {
    return this.cache.size
  }

  private evictIfNeeded(neededSize: number): void {
    while (
      (this.cache.size >= this.maxEntries ||
        this.estimatedBytes + neededSize > this.memoryBudgetBytes) &&
      this.cache.size > 0
    ) {
      const oldest = this.findEvictionCandidate()
      if (!oldest) break
      const entry = this.cache.get(oldest)
      if (entry) {
        this.estimatedBytes -= entry.size
        this.cache.delete(oldest)
        this.eventBus?.emit(MultimediaEventType.ResourceEvicted, { key: oldest })
      }
    }
  }

  private findEvictionCandidate(): string | null {
    let candidate: string | null = null
    let lowestScore = Infinity

    for (const [key, entry] of this.cache.entries()) {
      const score = entry.lastAccessed / Math.max(entry.accessCount, 1)
      if (score < lowestScore) {
        lowestScore = score
        candidate = key
      }
    }

    return candidate
  }
}
