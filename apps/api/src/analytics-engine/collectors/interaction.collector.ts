import { PrismaClient, Prisma } from '@prisma/client'
import type { AnalyticsEventInput } from '../types'

export class InteractionCollector {
  constructor(private prisma: PrismaClient) {}

  async track(input: AnalyticsEventInput): Promise<void> {
    await this.prisma.analyticsEvent.create({
      data: {
        userId: input.userId,
        sessionId: input.sessionId,
        eventType: input.eventType,
        properties: input.properties ? JSON.parse(JSON.stringify(input.properties)) : undefined,
      },
    })
  }

  async trackGameStarted(userId: string, sessionId: string, mode: string): Promise<void> {
    await this.track({
      userId,
      sessionId,
      eventType: 'game_started',
      properties: { mode },
    })
  }

  async trackGameCompleted(
    userId: string,
    sessionId: string,
    score: number,
    correct: number,
    incorrect: number,
  ): Promise<void> {
    await this.track({
      userId,
      sessionId,
      eventType: 'game_completed',
      properties: { score, correct, incorrect },
    })
  }

  async trackAnswer(
    userId: string,
    questionId: string,
    answer: string,
    isCorrect: boolean,
    attemptNumber: number,
    timeToAnswerMs: number,
  ): Promise<void> {
    await this.track({
      userId,
      eventType: isCorrect ? 'answer_correct' : 'answer_incorrect',
      properties: { questionId, answer, attemptNumber, timeToAnswerMs },
    })
  }

  async trackNavigation(userId: string, from: string, to: string): Promise<void> {
    await this.track({
      userId,
      eventType: 'navigation',
      properties: { from, to },
    })
  }

  async trackAchievement(userId: string, achievementKey: string): Promise<void> {
    await this.track({
      userId,
      eventType: 'achievement_unlocked',
      properties: { achievementKey },
    })
  }

  async getEvents(filter: {
    userId?: string
    eventType?: string
    fromDate?: Date
    toDate?: Date
    limit?: number
    offset?: number
  }): Promise<Array<{ id: string; eventType: string; properties: unknown; createdAt: Date }>> {
    const where: Prisma.AnalyticsEventWhereInput = {}
    if (filter.userId) where.userId = filter.userId
    if (filter.eventType) where.eventType = filter.eventType
    if (filter.fromDate || filter.toDate) {
      where.createdAt = {}
      if (filter.fromDate) where.createdAt.gte = filter.fromDate
      if (filter.toDate) where.createdAt.lte = filter.toDate
    }

    return this.prisma.analyticsEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filter.limit ?? 100,
      skip: filter.offset ?? 0,
      select: { id: true, eventType: true, properties: true, createdAt: true },
    })
  }
}
