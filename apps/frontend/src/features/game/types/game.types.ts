export interface GameStartRequest {
  lessonId: string
}

export interface GameQuestion {
  id: string
  type: 'LETTER' | 'NUMBER'
  audioKey: string
  displayText: string | null
  correctAnswer: string
  totalQuestions: number
}

export interface GameStartResponse {
  gameSessionId: string
  lessonId: string
  mode: 'LETTERS' | 'NUMBERS' | 'MIXED'
  status: string
  currentQuestion: GameQuestion
  score: number
  streak: number
  questionsAnswered: number
  totalQuestions: number
}

export interface SubmitAnswerRequest {
  gameSessionId: string
  questionId: string
  answer: string
}

export interface GameResult {
  totalScore: number
  totalCorrect: number
  totalIncorrect: number
  bestStreak: number
  stars: number
  xpEarned: number
  coinsEarned: number
}

export interface GameSubmitResponse {
  gameSessionId: string
  status: 'CORRECT' | 'INCORRECT' | 'COMPLETED'
  isCorrect: boolean
  attemptNumber: number
  correctAnswer: string
  pointsEarned: number
  streakBonus: number
  totalScore: number
  streak: number
  nextQuestion?: GameQuestion
  result?: GameResult
  message?: string
}

export interface GameStateResponse {
  gameSessionId: string
  status: string
  currentQuestion: GameQuestion | null
  score: number
  streak: number
  questionsAnswered: number
  totalQuestions: number
}

export type GameStatus = 'idle' | 'playing' | 'correct' | 'incorrect' | 'completed'
