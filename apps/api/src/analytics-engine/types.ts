export type AnalyticsEventType =
  | 'game_started'
  | 'game_completed'
  | 'answer_submitted'
  | 'answer_correct'
  | 'answer_incorrect'
  | 'lesson_started'
  | 'lesson_completed'
  | 'app_opened'
  | 'app_closed'
  | 'navigation'
  | 'achievement_unlocked'
  | 'streak_milestone'
  | 'settings_changed'

export type TimeRange = '7d' | '30d' | '90d' | 'all'

export interface AnalyticsEventInput {
  userId?: string
  sessionId?: string
  eventType: AnalyticsEventType
  properties?: Record<string, unknown>
}

export interface AnalyticsFilter {
  userId?: string
  eventType?: AnalyticsEventType
  fromDate?: Date
  toDate?: Date
  timeRange?: TimeRange
  limit?: number
  offset?: number
}

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

export interface AnalyticsQueryResult<T> {
  data: T
  total?: number
  page?: number
}
