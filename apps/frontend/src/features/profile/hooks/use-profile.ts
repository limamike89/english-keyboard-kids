import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { fetchGlobalStats } from '@/features/stats/services/stats.service'
import { fetchProgress } from '@/features/progress/services/progress.service'
import { API_ENDPOINTS } from '@/shared/utils/constants'

export function useProfile() {
  const displayName = useAuthStore((s) => s.displayName)
  const isInitialized = useAuthStore((s) => s.isInitialized)

  const statsQuery = useQuery({
    queryKey: [API_ENDPOINTS.STATS],
    queryFn: fetchGlobalStats,
    enabled: isInitialized,
  })

  const progressQuery = useQuery({
    queryKey: [API_ENDPOINTS.PROGRESS],
    queryFn: fetchProgress,
    enabled: isInitialized,
  })

  return {
    displayName,
    stats: statsQuery.data,
    progress: progressQuery.data?.progress ?? [],
    isLoading: !isInitialized || statsQuery.isLoading || progressQuery.isLoading,
    error: statsQuery.error ?? progressQuery.error,
  }
}
