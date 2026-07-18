import { GameSessionState, GameQuestion, GameResult } from '../core/types'

export interface SaveProgressInput {
  userId: string
  lessonId: string
  mode: string
  score: number
  totalCorrect: number
  totalIncorrect: number
  totalQuestions: number
  bestStreak: number
  streak: number
  stars: number
  completed: boolean
  xpEarned: number
  coinsEarned: number
}

export interface SaveAnswerInput {
  userId: string
  questionId: string
  lessonId: string
  answer: string
  isCorrect: boolean
  attemptNumber: number
}

export interface LoadQuestionsInput {
  lessonId: string
  mode: string
}

export interface IGamePersistence {
  loadQuestions(input: LoadQuestionsInput): Promise<GameQuestion[]>
  saveProgress(input: SaveProgressInput): Promise<void>
  saveAnswer(input: SaveAnswerInput): Promise<void>
  saveSessionState(state: GameSessionState): Promise<void>
  loadSessionState(sessionId: string): Promise<GameSessionState | null>
}
