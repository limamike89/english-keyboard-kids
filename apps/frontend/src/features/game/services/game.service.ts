import api from '@/shared/services/api'
import type { GameStartRequest, GameStartResponse, SubmitAnswerRequest, GameSubmitResponse, GameStateResponse } from '../types/game.types'

export async function startGame(body: GameStartRequest): Promise<GameStartResponse> {
  const { data } = await api.post('/game/start', body)
  return data.data
}

export async function submitAnswer(body: SubmitAnswerRequest): Promise<GameSubmitResponse> {
  const { data } = await api.post('/game/submit', body)
  return data.data
}

export async function getGameState(gameSessionId: string): Promise<GameStateResponse> {
  const { data } = await api.get(`/game/${gameSessionId}/state`)
  return data.data
}

export async function finishGame(gameSessionId: string): Promise<void> {
  await api.post(`/game/${gameSessionId}/finish`)
}
