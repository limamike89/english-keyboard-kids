export enum GameState {
  INITIAL = 'INITIAL',
  LOADING = 'LOADING',
  READY = 'READY',
  PLAYING = 'PLAYING',
  WAITING_FOR_ANSWER = 'WAITING_FOR_ANSWER',
  CORRECT = 'CORRECT',
  WRONG = 'WRONG',
  NEXT_QUESTION = 'NEXT_QUESTION',
  GAME_FINISHED = 'GAME_FINISHED',
  SAVING_RESULTS = 'SAVING_RESULTS',
  END = 'END',
}

export enum GameEventType {
  GameStarted = 'GameStarted',
  StateChanged = 'StateChanged',
  QuestionGenerated = 'QuestionGenerated',
  QuestionPresented = 'QuestionPresented',
  AnswerSubmitted = 'AnswerSubmitted',
  AnswerValidated = 'AnswerValidated',
  CorrectAnswer = 'CorrectAnswer',
  WrongAnswer = 'WrongAnswer',
  QuestionCompleted = 'QuestionCompleted',
  StreakUpdated = 'StreakUpdated',
  ScoreUpdated = 'ScoreUpdated',
  ProgressUpdated = 'ProgressUpdated',
  GameFinished = 'GameFinished',
  ResultsSaved = 'ResultsSaved',
  GameEnded = 'GameEnded',
  Error = 'Error',
}

export interface GameEvent {
  type: GameEventType
  timestamp: Date
  payload?: Record<string, unknown>
}

export type GameModeType = 'ALPHABET' | 'NUMBERS' | 'MIXED'

export interface GameQuestion {
  id: string
  type: 'LETTER' | 'NUMBER'
  audioKey: string
  displayText: string | null
  correctAnswer: string
  order: number
  difficulty?: string
  hint?: string | null
}

export interface GameSessionState {
  id: string
  userId: string
  lessonId: string
  mode: GameModeType
  state: GameState
  questions: GameQuestion[]
  currentQuestionIndex: number
  score: number
  streak: number
  bestStreak: number
  currentQuestionAttempts: number
  totalCorrect: number
  totalIncorrect: number
  questionsAnswered: number
  startTime: Date
  lastActivityAt: Date
  endTime?: Date
}

export interface GameResult {
  totalScore: number
  totalCorrect: number
  totalIncorrect: number
  bestStreak: number
  stars: number
  xpEarned: number
  coinsEarned: number
  accuracy: number
  totalTimeMs: number
  avgTimePerQuestionMs: number
}

export interface GameStartInput {
  lessonId: string
  userId: string
  mode: GameModeType
  questions: GameQuestion[]
  sessionId: string
}

export interface SubmitAnswerInput {
  gameSessionId: string
  questionId: string
  answer: string
}

export interface SubmitAnswerResult {
  gameSessionId: string
  isCorrect: boolean
  attemptNumber: number
  correctAnswer: string
  pointsEarned: number
  streakBonus: number
  totalScore: number
  streak: number
  status: 'CORRECT' | 'INCORRECT' | 'COMPLETED'
  nextQuestion?: GameQuestion & { totalQuestions: number }
  result?: GameResult
  message?: string
}

export interface GameStateResponse {
  gameSessionId: string
  state: GameState
  status: string
  currentQuestion: (GameQuestion & { totalQuestions: number }) | null
  score: number
  streak: number
  bestStreak: number
  questionsAnswered: number
  totalQuestions: number
  accuracy: number
}

export interface EventHandler {
  (event: GameEvent): void
}
