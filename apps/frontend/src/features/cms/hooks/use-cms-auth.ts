import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CmsUser } from '../types/cms.types'

interface CmsAuthState {
  token: string | null
  user: CmsUser | null
  isAuthenticated: boolean
  setSession: (token: string, user: CmsUser) => void
  logout: () => void
}

export const useCmsAuthStore = create<CmsAuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setSession: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => {
        localStorage.removeItem('cms-auth')
        set({ token: null, user: null, isAuthenticated: false })
      },
    }),
    { name: 'cms-auth' },
  ),
)

export function useCmsAuth() {
  const store = useCmsAuthStore()
  const hasRole = (...roles: string[]) => {
    if (!store.user) return false
    return roles.some((r) => store.user!.roles.includes(r))
  }
  const isAdmin = hasRole('ADMIN')
  const isEditor = hasRole('EDITOR')
  const isViewer = hasRole('VIEWER')
  const canEdit = isAdmin || isEditor
  const canView = canEdit || isViewer

  return { ...store, hasRole, isAdmin, isEditor, isViewer, canEdit, canView }
}
