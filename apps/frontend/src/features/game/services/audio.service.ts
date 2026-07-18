import api from '@/shared/services/api'

interface AudioResponse {
  key: string
  url: string
  format: string
  durationMs: number | null
  expiresAt: string | null
}

export async function resolveAudio(key: string): Promise<string> {
  const { data } = await api.get<{ data: AudioResponse }>(`/audio/${encodeURIComponent(key)}`)
  return data.data.url
}
