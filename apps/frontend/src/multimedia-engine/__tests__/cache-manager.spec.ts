import { describe, it, expect, vi } from 'vitest'
import { CacheManager } from '../core/cache-manager'

describe('CacheManager', () => {
  it('should store and retrieve items', () => {
    const cache = new CacheManager(10, 60000, 50)
    cache.set('key1', { data: 'test' }, 100)
    expect(cache.get('key1')).toEqual({ data: 'test' })
  })

  it('should return null for missing keys', () => {
    const cache = new CacheManager(10, 60000, 50)
    expect(cache.get('nonexistent')).toBeNull()
  })

  it('should report existence of items', () => {
    const cache = new CacheManager(10, 60000, 50)
    expect(cache.has('key1')).toBe(false)
    cache.set('key1', 'value', 10)
    expect(cache.has('key1')).toBe(true)
  })

  it('should evict oldest when at capacity', () => {
    const cache = new CacheManager(3, 60000, 50)
    cache.set('a', 1, 10)
    cache.set('b', 2, 10)
    cache.set('c', 3, 10)
    cache.set('d', 4, 10)

    expect(cache.get('a')).toBeNull()
    expect(cache.get('d')).toBe(4)
    expect(cache.getCacheSize()).toBeLessThanOrEqual(3)
  })

  it('should evict based on memory budget', () => {
    const cache = new CacheManager(100, 60000, 0.0005)
    cache.set('a', 1, 500)
    cache.set('b', 2, 500)

    expect(cache.get('a')).toBeNull()
    expect(cache.getCacheSize()).toBe(1)
  })

  it('should delete specific items', () => {
    const cache = new CacheManager(10, 60000, 50)
    cache.set('key1', 'value', 10)
    cache.delete('key1')
    expect(cache.has('key1')).toBe(false)
  })

  it('should clear all items', () => {
    const cache = new CacheManager(10, 60000, 50)
    cache.set('a', 1, 10)
    cache.set('b', 2, 10)
    cache.clear()
    expect(cache.getCacheSize()).toBe(0)
    expect(cache.get('a')).toBeNull()
  })

  it('should track hit rate', () => {
    const cache = new CacheManager(10, 60000, 50)
    cache.set('a', 1, 10)
    cache.get('a')
    cache.get('missing')

    const stats = cache.getStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBe(0.5)
  })

  it('should expire entries after max age', () => {
    vi.useFakeTimers()
    const cache = new CacheManager(10, 1000, 50)
    cache.set('a', 1, 10)
    expect(cache.has('a')).toBe(true)

    vi.advanceTimersByTime(1500)
    expect(cache.has('a')).toBe(false)
    expect(cache.get('a')).toBeNull()
    vi.useRealTimers()
  })

  it('should update access count on get', () => {
    const cache = new CacheManager(10, 60000, 50)
    cache.set('a', 1, 10)
    cache.get('a')
    cache.get('a')
    cache.get('a')

    const stats = cache.getStats()
    expect(stats.hits).toBe(3)
  })
})
