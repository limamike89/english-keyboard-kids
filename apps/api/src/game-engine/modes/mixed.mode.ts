import { BaseGameMode } from './game-mode.interface'
import { GameQuestion, GameModeType } from '../core/types'

export class MixedMode extends BaseGameMode {
  readonly type: GameModeType = 'MIXED'
  readonly name = 'Mixed'

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

    return questions.map((q, i) => ({
      id: q.id,
      type: q.type === 'NUMBER' ? 'NUMBER' : 'LETTER',
      audioKey: q.audioKey,
      displayText: q.displayText ?? null,
      correctAnswer: q.correctAnswer,
      order: q.order ?? i + 1,
      hint: q.hint ?? null,
    }))
  }

  getMaxAttempts(): number {
    return 3
  }

  getDisplayConfig(): Record<string, unknown> {
    return {
      icon: '🎯',
      title: 'Mixed',
      description: 'Letras y números combinados',
    }
  }
}
