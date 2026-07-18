import { useQuery } from '@tanstack/react-query'
import { useParentAuthStore } from '@/features/auth/store/parent-auth.store'
import { fetchChildren, fetchChildProgress, fetchParentSettings } from '../services/parent.service'

export function useParentChildren() {
  const isAuthenticated = useParentAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['parent', 'children'],
    queryFn: fetchChildren,
    enabled: isAuthenticated,
  })
}

export function useChildProgress(childId: string) {
  const isAuthenticated = useParentAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['parent', 'children', childId, 'progress'],
    queryFn: () => fetchChildProgress(childId),
    enabled: isAuthenticated && !!childId,
  })
}

export function useParentSettings() {
  const isAuthenticated = useParentAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['parent', 'settings'],
    queryFn: fetchParentSettings,
    enabled: isAuthenticated,
  })
}
