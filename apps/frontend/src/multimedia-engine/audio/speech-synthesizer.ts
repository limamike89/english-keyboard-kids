import type { Language } from '../types'
import { ErrorHandler } from '../core/error-handler'
import { getLanguageConfig } from '../config/language.config'

export interface SpeechOptions {
  rate?: number
  pitch?: number
  volume?: number
  lang?: Language
  voice?: SpeechSynthesisVoice | null
}

export class SpeechSynthesizer {
  private errorHandler: ErrorHandler
  private enabled: boolean
  private voices: SpeechSynthesisVoice[] = []
  private voicesLoaded = false

  constructor(errorHandler: ErrorHandler, enabled = true) {
    this.errorHandler = errorHandler
    this.enabled = enabled

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (speechSynthesis.getVoices().length > 0) {
        this.voices = speechSynthesis.getVoices()
        this.voicesLoaded = true
      } else {
        speechSynthesis.addEventListener('voiceschanged', () => {
          this.voices = speechSynthesis.getVoices()
          this.voicesLoaded = true
        }, { once: true })
      }
    }
  }

  get isEnabled(): boolean {
    return this.enabled && typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  get isSpeaking(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && speechSynthesis.speaking
  }

  get isPaused(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && speechSynthesis.paused
  }

  setEnabled(value: boolean): void {
    this.enabled = value
  }

  async speak(text: string, options: SpeechOptions = {}): Promise<void> {
    if (!this.isEnabled) return

    try {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = options.rate ?? 1
      utterance.pitch = options.pitch ?? 1
      utterance.volume = options.volume ?? 1

      const lang = options.lang ?? 'en'
      const config = getLanguageConfig(lang)
      utterance.lang = config.ttsLang

      if (options.voice) {
        utterance.voice = options.voice
      } else if (this.voicesLoaded) {
        const matchingVoice = this.voices.find(
          (v) => v.lang.startsWith(config.voicePrefix) && v.localService,
        )
        if (matchingVoice) {
          utterance.voice = matchingVoice
        }
      }

      return new Promise<void>((resolve, reject) => {
        utterance.onend = () => resolve()
        utterance.onerror = (event) => {
          const errorMessage = `Speech synthesis failed: ${event.error || 'unknown'}`
          reject(new Error(errorMessage))
        }
        window.speechSynthesis.speak(utterance)
      })
    } catch (error) {
      this.errorHandler.handleError({
        operation: 'speak',
        error: error instanceof Error ? error : String(error),
      })
    }
  }

  stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  pause(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause()
    }
  }

  resume(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume()
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.voices
  }

  isVoiceLoaded(): boolean {
    return this.voicesLoaded
  }
}
