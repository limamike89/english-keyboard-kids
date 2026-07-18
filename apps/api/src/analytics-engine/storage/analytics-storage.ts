import type { AnalyticsEventInput } from '../types'

export interface IAnalyticsStorage {
  saveEvent(input: AnalyticsEventInput): Promise<void>
  queryEvents(filter: Record<string, unknown>): Promise<unknown[]>
}

export interface IMetricsStorage {
  getMetric(userId: string): Promise<unknown | null>
  upsertMetric(userId: string, data: Record<string, unknown>): Promise<void>
}

export interface IDifficultyStorage {
  upsertDifficulty(
    userId: string,
    item: string,
    type: 'LETTER' | 'NUMBER',
    data: Record<string, unknown>,
  ): Promise<void>
  queryDifficulties(
    userId: string,
    type: 'LETTER' | 'NUMBER',
    orderBy: string,
    limit: number,
  ): Promise<unknown[]>
}
