export interface ProgressItem {
  lessonId: string
  lessonTitle: string
  lessonMode: string
  language: string
  score: number
  totalQuestions: number
  correctFirstTry: number
  stars: number
  bestStreak: number
  completed: boolean
  completedAt: string | null
  playCount: number
  lastPlayedAt: string
}

export interface ProgressSummary {
  totalLessons: number
  completedLessons: number
  totalScore: number
  totalStars: number
  averageAccuracy: number
  progress: ProgressItem[]
}
