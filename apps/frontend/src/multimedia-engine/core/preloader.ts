import type { PreloadPhase, PreloadProgress } from '../types'
import { MultimediaEventType } from '../types'
import { type EventBus } from './event-bus'
import { ResourceManager } from './resource-manager'
import { ErrorHandler } from './error-handler'

export class Preloader {
  private resourceManager: ResourceManager
  private eventBus: EventBus
  private errorHandler: ErrorHandler
  private concurrency: number
  private isPreloading = false
  private abortController: AbortController | null = null

  private phases: PreloadPhase[] = []

  constructor(
    resourceManager: ResourceManager,
    eventBus: EventBus,
    errorHandler: ErrorHandler,
    concurrency = 4,
  ) {
    this.resourceManager = resourceManager
    this.eventBus = eventBus
    this.errorHandler = errorHandler
    this.concurrency = concurrency
    this.buildPhases()
  }

  private buildPhases(): void {
    const sfxKeys = this.resourceManager.getAllAudioByCategory('sfx').map((r) => r.key)
    const musicKeys = this.resourceManager.getAllAudioByCategory('music').map((r) => r.key)

    this.phases = [
      {
        id: 1,
        label: 'Critical UI Sounds',
        resources: ['click', 'hover', ...sfxKeys.filter((k) => ['success', 'failure'].includes(k))],
      },
      {
        id: 2,
        label: 'Music & Feedback',
        resources: [...musicKeys, 'correct', 'wrong', 'excellent', 'congratulations'],
      },
      {
        id: 3,
        label: 'Voice & Instructions',
        resources: ['press-first-letter', 'press-number', 'repeat-after-me', 'try-again', 'amazing', 'great-job'],
      },
    ]
  }

  setConcurrency(value: number): void {
    this.concurrency = Math.max(1, value)
  }

  async preloadAll(onProgress?: (progress: PreloadProgress) => void): Promise<void> {
    if (this.isPreloading) return
    this.isPreloading = true
    this.abortController = new AbortController()

    const total = this.phases.reduce((sum, p) => sum + p.resources.length, 0)
    let loaded = 0

    for (const phase of this.phases) {
      if (this.abortController.signal.aborted) break

      this.eventBus.emit(MultimediaEventType.PreloadPhaseStarted, {
        phase: phase.id,
        label: phase.label,
        resourceCount: phase.resources.length,
      })

      const batchSize = this.concurrency
      for (let i = 0; i < phase.resources.length; i += batchSize) {
        if (this.abortController.signal.aborted) break

        const batch = phase.resources.slice(i, i + batchSize)
        const results = await Promise.allSettled(
          batch.map((key) => this.resourceManager.loadAudioBuffer(key)),
        )

        for (const result of results) {
          if (result.status === 'rejected') {
            this.errorHandler.handleError({
              operation: 'Preloader.preloadAll',
              error: result.reason instanceof Error ? result.reason : String(result.reason),
            })
          }
        }

        loaded += batch.length
        const progress: PreloadProgress = {
          phase: phase.id,
          totalPhases: this.phases.length,
          loaded,
          total,
          percentage: Math.round((loaded / total) * 100),
        }

        onProgress?.(progress)
      }

      this.eventBus.emit(MultimediaEventType.PreloadPhaseCompleted, {
        phase: phase.id,
        label: phase.label,
      })
    }

    this.isPreloading = false
    this.eventBus.emit(MultimediaEventType.AllResourcesLoaded, {
      totalLoaded: loaded,
      total,
    })
  }

  async preloadKeys(keys: string[]): Promise<void> {
    const batchSize = this.concurrency
    for (let i = 0; i < keys.length; i += batchSize) {
      const batch = keys.slice(i, i + batchSize)
      await Promise.allSettled(
        batch.map((key) => this.resourceManager.loadAudioBuffer(key)),
      )
    }
  }

  async preloadPredictive(currentKey: string, _mode: string): Promise<void> {
    const allVoice = this.resourceManager.getAllAudioBySubcategory('voice')
    const currentIndex = allVoice.findIndex((r) => r.key === currentKey)
    if (currentIndex === -1) return

    const nextKeys = allVoice
      .slice(currentIndex + 1, currentIndex + 3)
      .map((r) => r.key)

    if (nextKeys.length > 0) {
      await this.preloadKeys(nextKeys)
    }
  }

  cancel(): void {
    this.abortController?.abort()
    this.isPreloading = false
  }

  isActive(): boolean {
    return this.isPreloading
  }

  getPhases(): PreloadPhase[] {
    return this.phases
  }
}
