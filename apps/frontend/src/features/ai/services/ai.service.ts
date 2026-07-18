import api from '@/shared/services/api'

export interface AIQuestionSelection {
  questionId: string
  difficulty: number
  reason: string
}

export interface AIRecommendation {
  type: 'practice' | 'review' | 'advance' | 'streak_warning'
  message: string
  priority: number
  action?: Record<string, unknown>
}

export interface LearningPathNode {
  lessonId: string
  priority: number
  reason: string
  prerequisiteIds: string[]
}

export interface DifficultyInfo {
  level: number
  shouldIncrease: boolean
  shouldDecrease: boolean
}

export async function fetchAINextQuestions(lessonId: string, count = 10): Promise<AIQuestionSelection[]> {
  const { data } = await api.get(`/ai/next-questions?lessonId=${lessonId}&count=${count}`)
  return data.data
}

export async function fetchAIRecommendations(): Promise<AIRecommendation[]> {
  const { data } = await api.get('/ai/recommendations')
  return data.data
}

export async function fetchAIPersonalizedPath(): Promise<LearningPathNode[]> {
  const { data } = await api.get('/ai/personalized-path')
  return data.data
}

export async function fetchAIDifficulty(): Promise<DifficultyInfo> {
  const { data } = await api.get('/ai/difficulty')
  return data.data
}

export async function fetchAIDueCount(): Promise<number> {
  const { data } = await api.get('/ai/due-count')
  return data.data
}

export async function postAIRecordAnswer(questionId: string, isCorrect: boolean, timeToAnswerMs: number): Promise<void> {
  await api.post('/ai/record-answer', { questionId, isCorrect, timeToAnswerMs })
}

export async function fetchAIWeakAreaQuestions(mode: 'LETTERS' | 'NUMBERS', count = 5): Promise<AIQuestionSelection[]> {
  const { data } = await api.get(`/ai/weak-area-questions?mode=${mode}&count=${count}`)
  return data.data
}
