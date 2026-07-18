import type { Language } from '../types'

interface LocalizedAudioMap {
  instructions: Record<string, string>
  feedback: Record<string, string>
}

const LOCALIZED_AUDIO: Record<Language, LocalizedAudioMap> = {
  en: {
    instructions: {
      'press-first-letter': 'Press the first letter of {word}.',
      'press-number': 'Press number {number}.',
      'what-letter': 'What letter is this?',
      'find-the-letter': 'Find the letter {letter}.',
      'repeat-after-me': 'Repeat after me: {text}.',
      'listen-and-type': 'Listen and type the {item}.',
    },
    feedback: {
      correct: 'Correct!',
      wrong: 'Not quite. Try again!',
      excellent: 'Excellent!',
      'great-job': 'Great job!',
      amazing: 'Amazing!',
      'try-again': 'Try again!',
      congratulations: 'Congratulations!',
    },
  },
  es: {
    instructions: {
      'press-first-letter': 'Presiona la primera letra de {word}.',
      'press-number': 'Presiona el número {number}.',
      'what-letter': '¿Qué letra es esta?',
      'find-the-letter': 'Encuentra la letra {letter}.',
      'repeat-after-me': 'Repite después de mí: {text}.',
      'listen-and-type': 'Escucha y escribe {item}.',
    },
    feedback: {
      correct: '¡Correcto!',
      wrong: 'Casi. ¡Intenta de nuevo!',
      excellent: '¡Excelente!',
      'great-job': '¡Buen trabajo!',
      amazing: '¡Increíble!',
      'try-again': '¡Intenta de nuevo!',
      congratulations: '¡Felicidades!',
    },
  },
  fr: {
    instructions: {
      'press-first-letter': 'Appuie sur la première lettre de {word}.',
      'press-number': 'Appuie sur le nombre {number}.',
      'what-letter': 'Quelle lettre est-ce ?',
      'find-the-letter': 'Trouve la lettre {letter}.',
      'repeat-after-me': 'Répète après moi : {text}.',
      'listen-and-type': 'Écoute et tape {item}.',
    },
    feedback: {
      correct: 'Correct !',
      wrong:'Presque. Réessaie !',
      excellent: 'Excellent !',
      'great-job': 'Bon travail !',
      amazing: 'Incroyable !',
      'try-again': 'Réessaie !',
      congratulations: 'Félicitations !',
    },
  },
  pt: {
    instructions: {
      'press-first-letter': 'Aperte a primeira letra de {word}.',
      'press-number': 'Aperte o número {number}.',
      'what-letter': 'Que letra é esta?',
      'find-the-letter': 'Encontre a letra {letter}.',
      'repeat-after-me': 'Repita comigo: {text}.',
      'listen-and-type': 'Ouça e digite {item}.',
    },
    feedback: {
      correct: 'Correto!',
      wrong: 'Quase. Tente novamente!',
      excellent: 'Excelente!',
      'great-job': 'Ótimo trabalho!',
      amazing: 'Incrível!',
      'try-again': 'Tente novamente!',
      congratulations: 'Parabéns!',
    },
  },
}

export class AudioLocalization {
  private currentLanguage: Language = 'en'

  setLanguage(lang: Language): void {
    this.currentLanguage = lang
  }

  getLanguage(): Language {
    return this.currentLanguage
  }

  getInstruction(key: string, params?: Record<string, string>): string {
    const map = LOCALIZED_AUDIO[this.currentLanguage]?.instructions
    if (!map) return key

    let text = map[key]
    if (!text) return key

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, v)
      }
    }

    return text
  }

  getFeedback(key: string): string {
    const map = LOCALIZED_AUDIO[this.currentLanguage]?.feedback
    if (!map) return key
    return map[key] ?? key
  }

  getAvailableLanguages(): Language[] {
    return Object.keys(LOCALIZED_AUDIO) as Language[]
  }

  hasLanguage(lang: Language): boolean {
    return lang in LOCALIZED_AUDIO
  }
}

export const audioLocalization = new AudioLocalization()
