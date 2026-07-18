import { useState, useCallback, useEffect, useRef } from 'react'
import { useMultimedia } from './multimedia-context'
import { MultimediaEventType } from '../types'
import type { AudioCategory, AudioPlayerState } from '../types'

interface UseAudioOptions {
  key: string
  category?: AudioCategory
  autoPlay?: boolean
  loop?: boolean
  volume?: number
  onEnded?: () => void
}

interface UseAudioReturn {
  play: () => Promise<void>
  stop: () => void
  pause: () => void
  resume: () => void
  isPlaying: boolean
  isLoading: boolean
  state: AudioPlayerState | null
  error: string | null
}

export function useAudio(options: UseAudioOptions): UseAudioReturn {
  const { engine, isReady } = useMultimedia()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [state, setState] = useState<AudioPlayerState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    if (!isReady) return

    const unsubStarted = engine.eventBus.on(MultimediaEventType.AudioStarted, (e) => {
      if (e.data?.key === optionsRef.current.key) {
        setIsPlaying(true)
        setIsLoading(false)
        setError(null)
      }
    })

    const unsubFinished = engine.eventBus.on(MultimediaEventType.AudioFinished, (e) => {
      if (e.data?.key === optionsRef.current.key) {
        setIsPlaying(false)
        setIsLoading(false)
        optionsRef.current.onEnded?.()
      }
    })

    const unsubFailed = engine.eventBus.on(MultimediaEventType.AudioFailed, (e) => {
      if (e.data?.key === optionsRef.current.key) {
        setIsPlaying(false)
        setIsLoading(false)
        setError('Audio playback failed')
      }
    })

    const unsubStopped = engine.eventBus.on(MultimediaEventType.AudioStopped, (e) => {
      if (e.data?.key === optionsRef.current.key) {
        setIsPlaying(false)
        setIsLoading(false)
      }
    })

    return () => {
      unsubStarted()
      unsubFinished()
      unsubFailed()
      unsubStopped()
    }
  }, [isReady, engine.eventBus])

  const play = useCallback(async () => {
    if (!isReady) return
    setIsLoading(true)
    setError(null)
    await engine.playAudio(optionsRef.current.key, {
      category: optionsRef.current.category,
      loop: optionsRef.current.loop,
      volume: optionsRef.current.volume,
    })
  }, [isReady, engine])

  const stop = useCallback(() => {
    engine.stopAudio(optionsRef.current.key)
    setIsPlaying(false)
    setIsLoading(false)
  }, [engine])

  const pause = useCallback(() => {
    const playerState = engine.getAudioState(optionsRef.current.key)
    if (playerState?.isPlaying) {
      engine.audioManager.pauseAll()
      setIsPlaying(false)
    }
  }, [engine])

  const resume = useCallback(() => {
    engine.audioManager.resumeAll()
    setIsPlaying(true)
  }, [engine])

  useEffect(() => {
    if (options.autoPlay && isReady) {
      play()
    }
  }, [options.autoPlay, isReady, play])

  useEffect(() => {
    if (!isReady) return
    const interval = setInterval(() => {
      const s = engine.getAudioState(optionsRef.current.key)
      setState(s)
    }, 250)
    return () => clearInterval(interval)
  }, [isReady, engine])

  return { play, stop, pause, resume, isPlaying, isLoading, state, error }
}

export function useFeedbackAudio(): {
  playCorrect: () => Promise<void>
  playWrong: () => Promise<void>
  playExcellent: () => Promise<void>
  playGreatJob: () => Promise<void>
  playAmazing: () => Promise<void>
  playTryAgain: () => Promise<void>
  playCongratulations: () => Promise<void>
} {
  const { playFeedback } = useMultimedia()

  return {
    playCorrect: useCallback(() => playFeedback('correct'), [playFeedback]),
    playWrong: useCallback(() => playFeedback('wrong'), [playFeedback]),
    playExcellent: useCallback(() => playFeedback('excellent'), [playFeedback]),
    playGreatJob: useCallback(() => playFeedback('great-job'), [playFeedback]),
    playAmazing: useCallback(() => playFeedback('amazing'), [playFeedback]),
    playTryAgain: useCallback(() => playFeedback('try-again'), [playFeedback]),
    playCongratulations: useCallback(() => playFeedback('congratulations'), [playFeedback]),
  }
}
