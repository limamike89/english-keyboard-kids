export interface GlobalStats {
  totalGames: number;
  totalScore: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalQuestions: number;
  overallAccuracy: number;
  bestStreak: number;
  xp: number;
  coins: number;
}

export interface ModeStats {
  mode: string;
  gamesPlayed: number;
  totalScore: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalQuestions: number;
  accuracy: number;
  bestStreak: number;
  currentStreak: number;
  avgResponseTime: number | null;
  lastPlayedAt: string | null;
}

export interface HistoryEntry {
  id: string;
  lessonId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  attemptNumber: number;
  createdAt: string;
  question?: {
    audioKey: string;
    correctAnswer: string;
    displayText: string | null;
  };
}
