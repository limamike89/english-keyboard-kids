import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { fetchAnalyticsDashboard, fetchAnalyticsProfile, fetchTrends, fetchDailyActivity, fetchWeakestLetters, fetchWeakestNumbers, fetchRecommendations } from '../services/analytics.service'

export function useAnalyticsDashboard() {
  const isInitialized = useAuthStore((s) => s.isInitialized)

  const dashboardQuery = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: fetchAnalyticsDashboard,
    enabled: isInitialized,
  })

  return {
    dashboard: dashboardQuery.data,
    isLoading: !isInitialized || dashboardQuery.isLoading,
    error: dashboardQuery.error,
  }
}

export function useAnalyticsProfile() {
  const isInitialized = useAuthStore((s) => s.isInitialized)

  const profileQuery = useQuery({
    queryKey: ['analytics', 'profile'],
    queryFn: fetchAnalyticsProfile,
    enabled: isInitialized,
  })

  return {
    profile: profileQuery.data,
    isLoading: !isInitialized || profileQuery.isLoading,
    error: profileQuery.error,
  }
}

export function useTrends(days = 30) {
  const isInitialized = useAuthStore((s) => s.isInitialized)

  return useQuery({
    queryKey: ['analytics', 'trends', days],
    queryFn: () => fetchTrends(days),
    enabled: isInitialized,
  })
}

export function useDailyActivity(days = 30) {
  const isInitialized = useAuthStore((s) => s.isInitialized)

  return useQuery({
    queryKey: ['analytics', 'daily-activity', days],
    queryFn: () => fetchDailyActivity(days),
    enabled: isInitialized,
  })
}

export function useWeakestLetters() {
  const isInitialized = useAuthStore((s) => s.isInitialized)

  return useQuery({
    queryKey: ['analytics', 'weakest-letters'],
    queryFn: fetchWeakestLetters,
    enabled: isInitialized,
  })
}

export function useWeakestNumbers() {
  const isInitialized = useAuthStore((s) => s.isInitialized)

  return useQuery({
    queryKey: ['analytics', 'weakest-numbers'],
    queryFn: fetchWeakestNumbers,
    enabled: isInitialized,
  })
}

export function useRecommendations() {
  const isInitialized = useAuthStore((s) => s.isInitialized)

  return useQuery({
    queryKey: ['analytics', 'recommendations'],
    queryFn: fetchRecommendations,
    enabled: isInitialized,
  })
}
