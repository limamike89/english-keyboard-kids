export interface SessionResponse {
  id: string
  userId: string
  sessionToken: string
  displayName: string
  isAnonymous: boolean
  createdAt: string
  expiresAt: string
}

export interface AuthState {
  sessionToken: string | null
  userId: string | null
  displayName: string
  isAnonymous: boolean
  isInitialized: boolean
  setSession: (session: SessionResponse) => void
  clearSession: () => void
}
