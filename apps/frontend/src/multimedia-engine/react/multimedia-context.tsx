import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { MultimediaEngine, type MultimediaEngineOptions } from '../core/multimedia-engine'
import type { AudioCategory, Language, PreloadProgress, VolumeState } from '../types'
import { MultimediaEventType } from '../types'

interface MultimediaContextValue {
  engine: MultimediaEngine
  isReady: boolean
  isLoading: boolean
  loadProgress: PreloadProgress | null
  volume: VolumeState
  language: Language
  playAudio: (key: string, options?: Parameters<MultimediaEngine['playAudio']>[1]) => Promise<void>
  playFeedback: (key: string) => Promise<void>
  playInstruction: (key: string, params?: Record<string, string>) => Promise<void>
  playEffect: (key: string) => Promise<void>
  playMusic: (key: string, loop?: boolean) => Promise<void>
  stopAudio: (key?: string) => void
  stopMusic: () => void
  pauseAll: () => void
  resumeAll: () => void
  setVolume: (category: AudioCategory | 'master', value: number) => void
  setLanguage: (lang: Language) => void
  mute: (category?: AudioCategory) => void
  unmute: (category?: AudioCategory) => void
  isMuted: (category?: AudioCategory) => boolean
  preloadAll: (onProgress?: (p: PreloadProgress) => void) => Promise<void>
  preloadPredictive: (currentKey: string, mode: string) => Promise<void>
  speak: (text: string) => Promise<void>
  setSilentMode: (enabled: boolean) => void
}

const MultimediaContext = createContext<MultimediaContextValue | null>(null)

interface MultimediaProviderProps {
  children: ReactNode
  options?: MultimediaEngineOptions
}

export function MultimediaProvider({ children, options }: MultimediaProviderProps) {
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState<PreloadProgress | null>(null)
  const engineRef = useRef<MultimediaEngine | null>(null)
  const [volume, setVolumeState] = useState<VolumeState>({
    master: 0.8, music: 0.6, sfx: 1, voice: 1, ui: 0.8,
    muted: false, mutedCategories: new Set(),
  })
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const engine = new MultimediaEngine(options)
    engineRef.current = engine

    let cancelled = false

    const init = async () => {
      await engine.initialize()
      if (cancelled) return

      setVolumeState(engine.getVolumeState())
      setLanguageState(engine.getLanguage())
      setIsReady(true)

      setTimeout(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      }, 100)
    }

    init()

    const unsubVolume = engine.eventBus.on(MultimediaEventType.VolumeChanged, () => {
      if (!cancelled) setVolumeState(engine.getVolumeState())
    })
    const unsubMute = engine.eventBus.on(MultimediaEventType.MuteChanged, () => {
      if (!cancelled) setVolumeState(engine.getVolumeState())
    })
    const unsubLang = engine.eventBus.on(MultimediaEventType.LanguageChanged, (e) => {
      if (!cancelled && e.data?.language) {
        setLanguageState(e.data.language as Language)
      }
    })

    return () => {
      cancelled = true
      unsubVolume()
      unsubMute()
      unsubLang()
      engine.dispose()
      engineRef.current = null
    }
  }, [])

  const playAudio = useCallback(
    (key: string, opts?: Parameters<MultimediaEngine['playAudio']>[1]) =>
      engineRef.current?.playAudio(key, opts) ?? Promise.resolve(),
    [],
  )

  const playFeedback = useCallback(
    (key: string) => engineRef.current?.playFeedback(key) ?? Promise.resolve(),
    [],
  )

  const playInstruction = useCallback(
    (key: string, params?: Record<string, string>) =>
      engineRef.current?.playInstruction(key, params) ?? Promise.resolve(),
    [],
  )

  const playEffect = useCallback(
    (key: string) => engineRef.current?.playEffect(key) ?? Promise.resolve(),
    [],
  )

  const playMusic = useCallback(
    (key: string, loop?: boolean) => engineRef.current?.playMusic(key, loop) ?? Promise.resolve(),
    [],
  )

  const stopAudio = useCallback((key?: string) => engineRef.current?.stopAudio(key), [])
  const stopMusic = useCallback(() => engineRef.current?.stopMusic(), [])
  const pauseAll = useCallback(() => engineRef.current?.pauseAll(), [])
  const resumeAll = useCallback(() => engineRef.current?.resumeAll(), [])

  const setVolume = useCallback(
    (category: AudioCategory | 'master', value: number) =>
      engineRef.current?.setVolume(category, value),
    [],
  )

  const setLanguage = useCallback(
    (lang: Language) => engineRef.current?.setLanguage(lang),
    [],
  )

  const mute = useCallback(
    (category?: AudioCategory) => engineRef.current?.mute(category),
    [],
  )

  const unmute = useCallback(
    (category?: AudioCategory) => engineRef.current?.unmute(category),
    [],
  )

  const isMuted = useCallback(
    (category?: AudioCategory) => engineRef.current?.isMuted(category) ?? false,
    [],
  )

  const preloadAll = useCallback(
    async (onProgress?: (p: PreloadProgress) => void) => {
      await engineRef.current?.preloadAll((p) => {
        setLoadProgress(p)
        onProgress?.(p)
      })
    },
    [],
  )

  const preloadPredictive = useCallback(
    async (currentKey: string, mode: string) => {
      await engineRef.current?.preloadPredictive(currentKey, mode)
    },
    [],
  )

  const speak = useCallback(
    (text: string) => engineRef.current?.speak(text) ?? Promise.resolve(),
    [],
  )

  const setSilentMode = useCallback(
    (enabled: boolean) => engineRef.current?.setSilentMode(enabled),
    [],
  )

  return (
    <MultimediaContext.Provider
      value={{
        engine: engineRef.current!,
        isReady,
        isLoading,
        loadProgress,
        volume,
        language,
        playAudio,
        playFeedback,
        playInstruction,
        playEffect,
        playMusic,
        stopAudio,
        stopMusic,
        pauseAll,
        resumeAll,
        setVolume,
        setLanguage,
        mute,
        unmute,
        isMuted,
        preloadAll,
        preloadPredictive,
        speak,
        setSilentMode,
      }}
    >
      {children}
    </MultimediaContext.Provider>
  )
}

export function useMultimedia(): MultimediaContextValue {
  const ctx = useContext(MultimediaContext)
  if (!ctx) {
    throw new Error('useMultimedia must be used within a MultimediaProvider')
  }
  return ctx
}
