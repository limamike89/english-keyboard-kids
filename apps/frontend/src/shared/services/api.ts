import axios from 'axios'
import type { SessionResponse } from '@/features/auth/types/auth.types'

const SESSION_TOKEN_KEY = 'session-token'
const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(SESSION_TOKEN_KEY)
  if (token) {
    config.headers['x-session-token'] = token
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token)
    else reject(error)
  })
  failedQueue = []
}

async function refreshSession(): Promise<SessionResponse> {
  const displayName = `Player_${Math.random().toString(36).slice(2, 7)}`
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName }),
  })
  if (!res.ok) throw new Error('Failed to create session')
  const json = await res.json()
  return json.data as SessionResponse
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status !== 401 || originalRequest._retry || error.config.url === '/sessions') {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers['x-session-token'] = token
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const session = await refreshSession()
      localStorage.setItem(SESSION_TOKEN_KEY, session.sessionToken)

      const { useAuthStore } = await import('@/features/auth/store/auth.store')
      useAuthStore.getState().setSession(session)

      processQueue(null, session.sessionToken)
      originalRequest.headers['x-session-token'] = session.sessionToken
      return api(originalRequest)
    } catch (refreshError) {
      localStorage.removeItem(SESSION_TOKEN_KEY)
      processQueue(refreshError, null)
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
