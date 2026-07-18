import api from '@/shared/services/api'
import type { GlobalStats } from '../types/stats.types'

export async function fetchGlobalStats(): Promise<GlobalStats> {
  const { data } = await api.get('/stats')
  return data.data
}
