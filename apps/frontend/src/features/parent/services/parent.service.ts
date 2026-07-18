import api from '@/shared/services/api'
import { useParentAuthStore } from '@/features/auth/store/parent-auth.store'
import type { ParentAuthResponse, ParentChildrenResponse, ParentChildProgress, ParentChildAnalytics, ParentSettings, Report } from '../types/parent.types'

function authHeaders() {
  const token = useParentAuthStore.getState().token
  return { headers: { Authorization: `Bearer ${token}` } }
}

export async function registerParent(email: string, password: string, displayName: string): Promise<ParentAuthResponse> {
  const res = await api.post<{ data: ParentAuthResponse }>('/auth/parent/register', { email, password, displayName })
  return res.data.data
}

export async function loginParent(email: string, password: string): Promise<ParentAuthResponse> {
  const res = await api.post<{ data: ParentAuthResponse }>('/auth/parent/login', { email, password })
  return res.data.data
}

export async function fetchChildren(): Promise<ParentChildrenResponse[]> {
  const res = await api.get<{ data: ParentChildrenResponse[] }>('/parent/children', authHeaders())
  return res.data.data
}

export async function fetchChildProgress(childId: string): Promise<ParentChildProgress> {
  const res = await api.get<{ data: ParentChildProgress }>(`/parent/children/${childId}/progress`, authHeaders())
  return res.data.data
}

export async function fetchChildAnalytics(childId: string, days = 30): Promise<ParentChildAnalytics> {
  const res = await api.get<{ data: ParentChildAnalytics }>(`/parent/children/${childId}/analytics?days=${days}`, authHeaders())
  return res.data.data
}

export async function fetchParentSettings(): Promise<ParentSettings> {
  const res = await api.get<{ data: ParentSettings }>('/parent/settings', authHeaders())
  return res.data.data
}

export async function updateParentSettings(settings: Partial<ParentSettings>): Promise<ParentSettings> {
  const res = await api.put<{ data: ParentSettings }>('/parent/settings', settings, authHeaders())
  return res.data.data
}

export async function fetchReports(childId?: string): Promise<Report[]> {
  const query = childId ? `?childId=${childId}` : ''
  const res = await api.get<{ data: Report[] }>(`/parent/reports${query}`, authHeaders())
  return res.data.data
}

export async function generateReport(childId: string, period: string): Promise<Report> {
  const res = await api.post<{ data: Report }>('/parent/reports/generate', { childId, period }, authHeaders())
  return res.data.data
}

export async function generateLinkCode(): Promise<{ code: string }> {
  const res = await api.post<{ data: { code: string } }>('/auth/parent/link-code', {}, authHeaders())
  return res.data.data
}

export async function linkChild(childUsername: string): Promise<{ childId: string; childName: string }> {
  const res = await api.post<{ data: { childId: string; childName: string } }>('/auth/parent/link', { childUsername }, authHeaders())
  return res.data.data
}
