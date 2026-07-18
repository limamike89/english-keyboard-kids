export interface DifficultyConfig {
  baseDifficulty: number
  adaptiveFactor: number
  minDifficulty: number
  maxDifficulty: number
}

export interface PerformanceSnapshot {
  recentAccuracy: number
  recentAvgTimeMs: number
  totalAttempts: number
  streakLength: number
  weakItems: string[]
}

export interface QuestionSelection {
  questionId: string
  difficulty: number
  reason: string
}

export interface SpacedRepetitionItem {
  questionId: string
  easinessFactor: number
  interval: number
  repetitions: number
  nextReviewAt: Date
}

export interface LearningPathNode {
  lessonId: string
  priority: number
  reason: string
  prerequisiteIds: string[]
}

export interface AIRecommendation {
  type: 'practice' | 'review' | 'advance' | 'streak_warning'
  message: string
  priority: number
  action?: Record<string, unknown>
}
