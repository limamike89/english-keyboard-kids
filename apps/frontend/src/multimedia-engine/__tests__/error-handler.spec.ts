import { describe, it, expect, vi } from 'vitest'
import { ErrorHandler } from '../core/error-handler'

describe('ErrorHandler', () => {
  it('should handle errors with context', () => {
    const handler = new ErrorHandler()
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    handler.handleError({
      operation: 'playAudio',
      resourceKey: 'test-key',
      category: 'sfx',
      error: new Error('File not found'),
    })

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should call error callback when set', () => {
    const handler = new ErrorHandler()
    const callback = vi.fn()

    handler.setErrorCallback(callback)
    handler.handleError({
      operation: 'test',
      error: 'something went wrong',
    })

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ operation: 'test' }),
    )
  })

  it('should handle string errors', () => {
    const handler = new ErrorHandler()
    const callback = vi.fn()
    handler.setErrorCallback(callback)

    handler.handleError({
      operation: 'test',
      error: 'string error message',
    })

    expect(callback).toHaveBeenCalled()
  })

  it('should execute fallback callback', () => {
    const handler = new ErrorHandler()
    const fallback = vi.fn()

    handler.handleError(
      { operation: 'test', error: 'error' },
      fallback,
    )

    expect(fallback).toHaveBeenCalled()
  })

  it('should create safe async wrapper', async () => {
    const handler = new ErrorHandler()
    const safeFn = handler.createSafeAsync('test', 'key',
      async () => { throw new Error('fail') },
      'default',
    )

    const result = await safeFn()
    expect(result).toBe('default')
  })

  it('should handle critical errors', () => {
    const handler = new ErrorHandler()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const callback = vi.fn()
    handler.setErrorCallback(callback)

    handler.handleCritical({
      operation: 'critical',
      error: 'fatal error',
    })

    expect(consoleSpy).toHaveBeenCalled()
    expect(callback).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should respect log level', () => {
    const handler = new ErrorHandler()
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    handler.setLogLevel('error')
    handler.handleError({ operation: 'test', error: 'msg' })

    expect(infoSpy).not.toHaveBeenCalled()
    infoSpy.mockRestore()
  })
})
