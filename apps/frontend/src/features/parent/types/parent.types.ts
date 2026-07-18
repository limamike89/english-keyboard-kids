export interface ParentAuthResponse {
  token: string
  user: {
    id: string
    email: string
    displayName: string
  }
}

export interface ParentChildrenResponse {
  id: string
  displayName: string
  username: string
  xp: number
  coins: number
  relationship: string | null
  linkedAt: string
  createdAt: string
}

export interface ParentChildProgress {
  stats: {
    totalGames: number
    totalCorrect: number
    totalIncorrect: number
    totalQuestions: number
    accuracy: number
  }
  metric: {
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
  } | null
  progress: Array<{
    lessonId: string
    lessonTitle: string
    lessonMode: string
    score: number
    totalQuestions: number
    stars: number
    completed: boolean
    completedAt: string | null
    playCount: number
    lastPlayedAt: string
  }>
  dailyStreak: Array<{
    date: string
    completed: boolean
    xpEarned: number
  }>
  achievements: Array<{
    achievement: {
      name: string
      icon: string
      description: string
    }
    unlockedAt: string
  }>
  currentStreak: number
}

export interface ParentChildAnalytics {
  weakestLetters: Array<{ item: string; attempts: number; correct: number; incorrect: number; accuracy: number }>
  weakestNumbers: Array<{ item: string; attempts: number; correct: number; incorrect: number; accuracy: number }>
  recentActivity: Array<{ type: string; at: string; details: unknown }>
}

export interface ParentSettings {
  dailyTimeLimit: number | null
  contentRestrictions: Record<string, unknown> | null
  enableReports: boolean
  reportFrequency: string
}

export interface Report {
  id: string
  childId: string
  period: string
  periodStart: string
  periodEnd: string
  data: Record<string, unknown>
  generatedAt: string
}
