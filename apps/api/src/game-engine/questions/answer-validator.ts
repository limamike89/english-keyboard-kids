export interface ValidationOptions {
  caseSensitive?: boolean
  trimWhitespace?: boolean
  normalizeUnicode?: boolean
}

export interface ValidationResult {
  isCorrect: boolean
  normalizedAnswer: string
  normalizedCorrectAnswer: string
}

export class AnswerValidator {
  private options: ValidationOptions

  constructor(options?: ValidationOptions) {
    this.options = {
      caseSensitive: false,
      trimWhitespace: true,
      normalizeUnicode: true,
      ...options,
    }
  }

  validate(answer: string, correctAnswer: string): ValidationResult {
    let normalizedAnswer = answer
    let normalizedCorrect = correctAnswer

    if (this.options.trimWhitespace) {
      normalizedAnswer = normalizedAnswer.trim()
      normalizedCorrect = normalizedCorrect.trim()
    }

    if (!this.options.caseSensitive) {
      normalizedAnswer = normalizedAnswer.toUpperCase()
      normalizedCorrect = normalizedCorrect.toUpperCase()
    }

    if (this.options.normalizeUnicode) {
      normalizedAnswer = normalizedAnswer.normalize('NFC')
      normalizedCorrect = normalizedCorrect.normalize('NFC')
    }

    return {
      isCorrect: normalizedAnswer === normalizedCorrect,
      normalizedAnswer,
      normalizedCorrectAnswer: normalizedCorrect,
    }
  }

  setOptions(options: ValidationOptions): void {
    this.options = { ...this.options, ...options }
  }
}
