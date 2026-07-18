import type { AudioCategory } from '../types'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface ErrorContext {
  operation: string
  resourceKey?: string
  category?: AudioCategory
  error: Error | string
}

export class ErrorHandler {
  private logLevel: LogLevel = 'warn'
  private onError: ((ctx: ErrorContext) => void) | null = null

  setLogLevel(level: LogLevel): void {
    this.logLevel = level
  }

  setErrorCallback(callback: (ctx: ErrorContext) => void): void {
    this.onError = callback
  }

  handleError(ctx: ErrorContext, fallback?: () => void): void {
    const message = typeof ctx.error === 'string' ? ctx.error : ctx.error.message
    const tag = `[MultimediaEngine:${ctx.operation}]`

    if (this.logLevel === 'debug' || this.logLevel === 'info') {
      console.info(`${tag} ${message}`, { resourceKey: ctx.resourceKey, category: ctx.category })
    }
    if (this.logLevel === 'warn' || this.logLevel === 'error') {
      console.warn(`${tag} ${message}`)
    }

    this.onError?.(ctx)
    fallback?.()
  }

  handleCritical(ctx: ErrorContext): void {
    const message = typeof ctx.error === 'string' ? ctx.error : ctx.error.message
    console.error(`[MultimediaEngine:${ctx.operation}] CRITICAL: ${message}`)
    this.onError?.(ctx)
  }

  createSafeAsync<Args extends unknown[], T>(
    operation: string,
    resourceKey: string | undefined,
    fn: (...args: Args) => Promise<T>,
    fallback: T,
  ): (...args: Args) => Promise<T> {
    return async (...args: Args): Promise<T> => {
      try {
        return await fn(...args)
      } catch (error) {
        this.handleError({
          operation,
          resourceKey,
          error: error instanceof Error ? error : String(error),
        })
        return fallback
      }
    }
  }
}
