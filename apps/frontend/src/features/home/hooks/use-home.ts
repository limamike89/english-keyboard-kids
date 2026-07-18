import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { createSession } from '@/features/auth/services/auth.service'
import { fetchLessons } from '@/features/lessons/services/lesson.service'
import { ROUTES, API_ENDPOINTS } from '@/shared/utils/constants'

export function useHome() {
  const navigate = useNavigate()
  const { sessionToken, displayName, isInitialized, setSession } = useAuthStore()

  useEffect(() => {
    if (isInitialized) return
    if (sessionToken) {
      useAuthStore.setState({ isInitialized: true })
      return
    }
    createSession()
      .then(setSession)
      .catch(() => {
        useAuthStore.setState({ isInitialized: true })
      })
  }, [sessionToken, isInitialized, setSession])

  const {
    data: lessons = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [API_ENDPOINTS.LESSONS],
    queryFn: fetchLessons,
    enabled: isInitialized,
  })

  const handleSelect = (lessonId: string) => {
    navigate(`${ROUTES.GAME}/${lessonId}`)
  }

  return {
    displayName,
    lessons,
    isLoading: !isInitialized || isLoading,
    error,
    handleSelect,
  }
}
