import { useState } from 'react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import api from '@/shared/services/api'

export function useSettings() {
  const { displayName, setSession } = useAuthStore()
  const [updateError, setUpdateError] = useState<string | null>(null)

  const updateDisplayName = async (name: string) => {
    setUpdateError(null)
    try {
      const { data } = await api.patch('/sessions/me', { displayName: name })
      const session = data.data
      setSession({
        id: session.id,
        userId: session.userId,
        sessionToken: session.sessionToken,
        displayName: session.displayName,
        isAnonymous: session.isAnonymous,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      })
    } catch {
      setUpdateError('No se pudo guardar el nombre.')
    }
  }

  return {
    displayName,
    updateDisplayName,
    updateError,
  }
}
