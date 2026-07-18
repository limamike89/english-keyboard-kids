import type { Language } from '../types'
import { LANGUAGE_VOICE_CONFIG } from '../config/language.config'

interface VoiceInfo {
  name: string
  lang: string
  isLocal: boolean
  isDefault: boolean
}

export class VoiceRegistry {
  private voices: VoiceInfo[] = []
  private loaded = false

  async initialize(): Promise<void> {
    if (this.loaded) return

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.loaded = true
      return
    }

    const voices = speechSynthesis.getVoices()
    if (voices.length > 0) {
      this.processVoices(voices)
      this.loaded = true
      return
    }

    return new Promise((resolve) => {
      speechSynthesis.addEventListener('voiceschanged', () => {
        this.processVoices(speechSynthesis.getVoices())
        this.loaded = true
        resolve()
      }, { once: true })
    })
  }

  getVoicesForLanguage(lang: Language): VoiceInfo[] {
    const config = LANGUAGE_VOICE_CONFIG[lang]
    return this.voices.filter((v) => v.lang.startsWith(config.voicePrefix))
  }

  getDefaultVoice(lang: Language): VoiceInfo | undefined {
    const langVoices = this.getVoicesForLanguage(lang)
    return langVoices.find((v) => v.isLocal) ?? langVoices[0]
  }

  getAllVoices(): VoiceInfo[] {
    return this.voices
  }

  isLoaded(): boolean {
    return this.loaded
  }

  private processVoices(voices: SpeechSynthesisVoice[]): void {
    this.voices = voices.map((v) => ({
      name: v.name,
      lang: v.lang,
      isLocal: v.localService,
      isDefault: v.default,
    }))
  }
}

export const voiceRegistry = new VoiceRegistry()
