import type { Language } from '../types'

export interface LanguageVoiceConfig {
  lang: Language
  label: string
  voicePrefix: string
  ttsLang: string
}

export const LANGUAGE_VOICE_CONFIG: Record<Language, LanguageVoiceConfig> = {
  en: { lang: 'en', label: 'English', voicePrefix: 'en', ttsLang: 'en-US' },
  es: { lang: 'es', label: 'Español', voicePrefix: 'es', ttsLang: 'es-ES' },
  fr: { lang: 'fr', label: 'Français', voicePrefix: 'fr', ttsLang: 'fr-FR' },
  pt: { lang: 'pt', label: 'Português', voicePrefix: 'pt', ttsLang: 'pt-BR' },
}

export function getLanguageConfig(lang: Language): LanguageVoiceConfig {
  return LANGUAGE_VOICE_CONFIG[lang]
}

export function isLanguageSupported(lang: string): lang is Language {
  return lang in LANGUAGE_VOICE_CONFIG
}
