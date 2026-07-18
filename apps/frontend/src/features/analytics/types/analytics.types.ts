export interface MetricSummary {
  totalGames: number
  totalCorrect: number
  totalIncorrect: number
  totalQuestions: number
  accuracy: number
  bestStreak: number
  currentStreak: number
  totalXp: number
  totalCoins: number
  avgResponseTimeMs: number
  gamesCompleted: number
}

export interface ItemDifficulty {
  item: string
  attempts: number
  correct: number
  incorrect: number
  accuracy: number
}

export interface DailyActivity {
  date: string
  gamesPlayed: number
  questionsAnswered: number
  correct: number
  incorrect: number
  xpEarned: number
}

export interface TrendData {
  dates: string[]
  accuracy: number[]
  gamesPlayed: number[]
  avgResponseTime: number[]
}

export interface LearnerProfile {
  userId: string
  metrics: MetricSummary
  weakestLetters: ItemDifficulty[]
  weakestNumbers: ItemDifficulty[]
  strongestLetters: ItemDifficulty[]
  strongestNumbers: ItemDifficulty[]
  recentActivity: DailyActivity[]
  recommendations: string[]
}

export interface AnalyticsDashboard {
  profile: LearnerProfile
  trends: TrendData
  metrics: MetricSummary | null
}
