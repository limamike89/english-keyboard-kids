import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { fetchAIRecommendations, fetchAIDifficulty, fetchAIPersonalizedPath, fetchAIDueCount } from '../services/ai.service'

export function useAIRecommendations() {
  const isInitialized = useAuthStore((s) => s.isInitialized)

  return useQuery({
    queryKey: ['ai', 'recommendations'],
    queryFn: fetchAIRecommendations,
    enabled: isInitialized,
    refetchInterval: 60_000,
  })
}

export function useAIDifficulty() {
  const isInitialized = useAuthStore((s) => s.isInitialized)

  return useQuery({
    queryKey: ['ai', 'difficulty'],
    queryFn: fetchAIDifficulty,
    enabled: isInitialized,
  })
}

export function useAIPersonalizedPath() {
  const isInitialized = useAuthStore((s) => s.isInitialized)

  return useQuery({
    queryKey: ['ai', 'path'],
    queryFn: fetchAIPersonalizedPath,
    enabled: isInitialized,
  })
}

export function useAIDueCount() {
  const isInitialized = useAuthStore((s) => s.isInitialized)

  return useQuery({
    queryKey: ['ai', 'due-count'],
    queryFn: fetchAIDueCount,
    enabled: isInitialized,
  })
}
