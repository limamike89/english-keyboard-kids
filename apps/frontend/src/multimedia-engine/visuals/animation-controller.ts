import type { MultimediaConfig } from '../types'
import { MultimediaEventType } from '../types'
import { type EventBus } from '../core/event-bus'

export type AnimationType = 'correct' | 'wrong' | 'celebration' | 'bounce' | 'fadeIn' | 'fadeOut' | 'slideIn' | 'pulse'

interface AnimationOptions {
  duration?: number
  delay?: number
  easing?: string
  onComplete?: () => void
}

export class AnimationController {
  private eventBus: EventBus
  private config: MultimediaConfig
  private runningAnimations = new Set<string>()

  constructor(eventBus: EventBus, config: MultimediaConfig) {
    this.eventBus = eventBus
    this.config = config
  }

  isEnabled(): boolean {
    return this.config.animationsEnabled
  }

  setEnabled(value: boolean): void {
    this.config.animationsEnabled = value
  }

  animate(
    element: HTMLElement,
    type: AnimationType,
    options: AnimationOptions = {},
  ): Promise<void> {
    if (!this.config.animationsEnabled) {
      options.onComplete?.()
      return Promise.resolve()
    }

    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    this.runningAnimations.add(id)

    const duration = options.duration ?? this.getDefaultDuration(type)
    const easing = options.easing ?? 'ease-out'

    return new Promise((resolve) => {
      element.style.setProperty('--anim-duration', `${duration}ms`)
      element.style.setProperty('--anim-easing', easing)

      const animationClass = `mm-anim-${type}`
      element.classList.add(animationClass)

      const timer = setTimeout(() => {
        element.classList.remove(animationClass)
        this.runningAnimations.delete(id)
        this.eventBus.emit(MultimediaEventType.AnimationCompleted, { type, id })
        options.onComplete?.()
        resolve()
      }, duration + (options.delay ?? 0))

      const cleanup = () => {
        clearTimeout(timer)
        element.classList.remove(animationClass)
        this.runningAnimations.delete(id)
      }

      Object.defineProperty(cleanup, 'id', { value: id })
    })
  }

  async correctAnswer(element: HTMLElement): Promise<void> {
    return this.animate(element, 'correct', { duration: 600 })
  }

  async wrongAnswer(element: HTMLElement): Promise<void> {
    return this.animate(element, 'wrong', { duration: 500 })
  }

  async celebrate(element: HTMLElement): Promise<void> {
    return this.animate(element, 'celebration', { duration: 1200 })
  }

  getRunningCount(): number {
    return this.runningAnimations.size
  }

  private getDefaultDuration(type: AnimationType): number {
    const durations: Record<AnimationType, number> = {
      correct: 600,
      wrong: 500,
      celebration: 1200,
      bounce: 400,
      fadeIn: 300,
      fadeOut: 300,
      slideIn: 400,
      pulse: 800,
    }
    return durations[type]
  }
}
