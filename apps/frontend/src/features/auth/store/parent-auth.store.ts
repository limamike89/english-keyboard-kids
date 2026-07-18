import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ParentAuthState {
  token: string | null
  user: { id: string; email: string; displayName: string } | null
  isAuthenticated: boolean
  setParentSession: (token: string, user: { id: string; email: string; displayName: string }) => void
  logout: () => void
}

export const useParentAuthStore = create<ParentAuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setParentSession: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    { name: 'parent-auth' },
  ),
)
