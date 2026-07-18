import { create } from 'zustand'
import type { AuthState, SessionResponse } from '../types/auth.types'
import { STORAGE_KEYS } from '@/shared/utils/constants'

export const useAuthStore = create<AuthState>((set) => ({
  sessionToken: localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN),
  userId: null,
  displayName: '',
  isAnonymous: true,
  isInitialized: false,

  setSession: (session: SessionResponse) => {
    localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, session.sessionToken)
    set({
      sessionToken: session.sessionToken,
      userId: session.userId,
      displayName: session.displayName,
      isAnonymous: session.isAnonymous,
      isInitialized: true,
    })
  },

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN)
    set({
      sessionToken: null,
      userId: null,
      displayName: '',
      isAnonymous: true,
      isInitialized: true,
    })
  },
}))
