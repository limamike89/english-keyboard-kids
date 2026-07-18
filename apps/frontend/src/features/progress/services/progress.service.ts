import api from '@/shared/services/api'
import type { ProgressSummary } from '../types/progress.types'

export async function fetchProgress(): Promise<ProgressSummary> {
  const { data } = await api.get('/progress')
  return data.data
}
