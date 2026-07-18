import { GameMode } from '@prisma/client';

export type GameStatus = 'PLAYING' | 'CORRECT' | 'INCORRECT' | 'COMPLETED' | 'ABANDONED';

export interface GameSessionQuestion {
  id: string;
  type: 'LETTER' | 'NUMBER';
  audioKey: string;
  displayText: string | null;
  correctAnswer: string;
  order: number;
}

export interface GameSession {
  id: string;
  userId: string;
  lessonId: string;
  mode: GameMode;
  status: GameStatus;
  questions: GameSessionQuestion[];
  currentQuestionIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  currentQuestionAttempts: number;
  totalCorrect: number;
  totalIncorrect: number;
  createdAt: Date;
  lastActivityAt: Date;
}

export interface GameStartResponse {
  gameSessionId: string;
  lessonId: string;
  mode: GameMode;
  status: GameStatus;
  currentQuestion: GameSessionQuestion & { totalQuestions: number };
  score: number;
  streak: number;
  questionsAnswered: number;
  totalQuestions: number;
}

export interface GameSubmitResponse {
  gameSessionId: string;
  status: GameStatus;
  isCorrect: boolean;
  attemptNumber: number;
  correctAnswer: string;
  pointsEarned: number;
  streakBonus: number;
  totalScore: number;
  streak: number;
  message?: string;
  nextQuestion?: GameSessionQuestion & { totalQuestions: number };
  result?: GameResult;
}

export interface GameResult {
  totalScore: number;
  totalCorrect: number;
  totalIncorrect: number;
  bestStreak: number;
  stars: number;
  xpEarned: number;
  coinsEarned: number;
}

export interface GameStateResponse {
  gameSessionId: string;
  status: GameStatus;
  currentQuestion: GameSessionQuestion & { totalQuestions: number } | null;
  score: number;
  streak: number;
  questionsAnswered: number;
  totalQuestions: number;
}

export interface GameFinishResponse {
  gameSessionId: string;
  status: GameStatus;
  finalScore: number;
  questionsAnswered: number;
  totalQuestions: number;
}
