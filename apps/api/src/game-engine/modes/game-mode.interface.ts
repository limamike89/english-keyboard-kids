import { GameQuestion, GameModeType } from '../core/types'
import { ScoringConfig } from '../scoring/scoring-config'

export interface IGameMode {
  readonly type: GameModeType
  readonly name: string

  generateQuestions(raw: unknown[]): GameQuestion[]
  validateAnswer(answer: string, correctAnswer: string): boolean
  getMaxAttempts(): number
  supportsRetry(): boolean
  getDisplayConfig(): Record<string, unknown>
}

export abstract class BaseGameMode implements IGameMode {
  abstract readonly type: GameModeType
  abstract readonly name: string

  abstract generateQuestions(raw: unknown[]): GameQuestion[]

  validateAnswer(answer: string, correctAnswer: string): boolean {
    return answer.trim().toUpperCase() === correctAnswer.trim().toUpperCase()
  }

  getMaxAttempts(): number {
    return 3
  }

  supportsRetry(): boolean {
    return true
  }

  getDisplayConfig(): Record<string, unknown> {
    return {}
  }
}
