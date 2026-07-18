import api from '@/shared/services/api'
import type { AnalyticsDashboard, LearnerProfile, TrendData, DailyActivity, ItemDifficulty } from '../types/analytics.types'

export async function fetchAnalyticsProfile(): Promise<LearnerProfile> {
  const { data } = await api.get('/analytics/profile')
  return data.data
}

export async function fetchAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  const { data } = await api.get('/analytics/dashboard')
  return data.data
}

export async function fetchTrends(days = 30): Promise<TrendData> {
  const { data } = await api.get(`/analytics/trends?days=${days}`)
  return data.data
}

export async function fetchDailyActivity(days = 30): Promise<DailyActivity[]> {
  const { data } = await api.get(`/analytics/daily-activity?days=${days}`)
  return data.data
}

export async function fetchWeakestLetters(): Promise<ItemDifficulty[]> {
  const { data } = await api.get('/analytics/weakest-letters')
  return data.data
}

export async function fetchWeakestNumbers(): Promise<ItemDifficulty[]> {
  const { data } = await api.get('/analytics/weakest-numbers')
  return data.data
}

export async function fetchRecommendations(): Promise<string[]> {
  const { data } = await api.get('/analytics/recommendations')
  return data.data
}

export async function trackEvent(eventType: string, properties?: Record<string, unknown>): Promise<void> {
  await api.post('/analytics/track', { eventType, properties })
}

export async function recordAnswer(questionId: string, isCorrect: boolean): Promise<void> {
  await api.post('/analytics/record-answer', { questionId, isCorrect })
}
