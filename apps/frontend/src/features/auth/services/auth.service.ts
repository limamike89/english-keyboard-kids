import api from '@/shared/services/api'
import type { SessionResponse } from '../types/auth.types'

export async function createSession(displayName?: string): Promise<SessionResponse> {
  const { data } = await api.post('/sessions', {
    displayName: displayName ?? `Player_${Math.random().toString(36).slice(2, 7)}`,
  })
  const raw = data.data
  return {
    id: raw.user.id,
    userId: raw.user.id,
    sessionToken: raw.sessionToken,
    displayName: raw.user.displayName,
    isAnonymous: raw.user.isAnonymous,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    expiresAt: raw.expiresAt ?? '',
  }
}

export async function redeemLinkCode(code: string): Promise<{ parentName: string }> {
  const { data } = await api.post('/sessions/link', { code })
  return data.data
}
