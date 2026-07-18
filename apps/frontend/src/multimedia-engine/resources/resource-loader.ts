import { ErrorHandler } from '../core/error-handler'

export class ResourceLoader {
  private errorHandler: ErrorHandler
  private inflightRequests = new Map<string, Promise<unknown>>()
  private maxConcurrency: number
  private activeCount = 0
  private queue: (() => void)[] = []

  constructor(errorHandler: ErrorHandler, maxConcurrency = 4) {
    this.errorHandler = errorHandler
    this.maxConcurrency = maxConcurrency
  }

  setMaxConcurrency(value: number): void {
    this.maxConcurrency = Math.max(1, value)
  }

  async loadAudio(url: string, key: string): Promise<ArrayBuffer | null> {
    return this.loadWithCache(key, () => this.fetchArrayBuffer(url), 'loadAudio')
  }

  async loadImage(url: string, key: string): Promise<HTMLImageElement | null> {
    return this.loadWithCache(key, () => this.fetchImage(url), 'loadImage')
  }

  async loadBlob(url: string, key: string): Promise<Blob | null> {
    return this.loadWithCache(key, () => this.fetchBlob(url), 'loadBlob')
  }

  cancelInflight(key: string): void {
    this.inflightRequests.delete(key)
  }

  cancelAll(): void {
    this.inflightRequests.clear()
    this.queue = []
    this.activeCount = 0
  }

  getActiveCount(): number {
    return this.activeCount
  }

  private async loadWithCache<T>(
    key: string,
    loader: () => Promise<T>,
    operation: string,
  ): Promise<T | null> {
    if (this.inflightRequests.has(key)) {
      return this.inflightRequests.get(key) as Promise<T | null>
    }

    const promise = this.schedule(loader, operation, key)
    this.inflightRequests.set(key, promise)

    try {
      const result = await promise
      return result
    } finally {
      this.inflightRequests.delete(key)
    }
  }

  private async schedule<T>(
    loader: () => Promise<T>,
    operation: string,
    key: string,
  ): Promise<T | null> {
    if (this.activeCount >= this.maxConcurrency) {
      await new Promise<void>((resolve) => {
        this.queue.push(resolve)
      })
    }

    this.activeCount++
    try {
      return await this.errorHandler.createSafeAsync(
        operation,
        key,
        loader,
        null as T | null,
      )()
    } finally {
      this.activeCount--
      this.processQueue()
    }
  }

  private processQueue(): void {
    while (this.queue.length > 0 && this.activeCount < this.maxConcurrency) {
      const next = this.queue.shift()
      next?.()
    }
  }

  private async fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url, { method: 'GET', credentials: 'include' })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.arrayBuffer()
  }

  private async fetchImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  }

  private async fetchBlob(url: string): Promise<Blob> {
    const response = await fetch(url, { method: 'GET', credentials: 'include' })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.blob()
  }
}
