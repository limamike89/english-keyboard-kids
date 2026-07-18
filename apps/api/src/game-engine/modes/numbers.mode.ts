import { BaseGameMode } from './game-mode.interface'
import { GameQuestion, GameModeType } from '../core/types'

export class NumbersMode extends BaseGameMode {
  readonly type: GameModeType = 'NUMBERS'
  readonly name = 'Numbers'

  generateQuestions(raw: unknown[]): GameQuestion[] {
    const questions = raw as Array<{
      id: string
      audioKey: string
      correctAnswer: string
      displayText?: string | null
      order?: number
      hint?: string | null
      type?: string
    }>

    return questions
      .filter((q) => !q.type || q.type === 'NUMBER')
      .map((q, i) => ({
        id: q.id,
        type: 'NUMBER' as const,
        audioKey: q.audioKey,
        displayText: q.displayText ?? null,
        correctAnswer: q.correctAnswer,
        order: q.order ?? i + 1,
        hint: q.hint ?? null,
      }))
  }

  getDisplayConfig(): Record<string, unknown> {
    return {
      icon: '🔢',
      title: 'Numbers',
      description: 'Aprende los números',
    }
  }
}
