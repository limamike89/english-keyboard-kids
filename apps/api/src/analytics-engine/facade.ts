import { PrismaClient } from '@prisma/client'
import { InteractionCollector } from './collectors/interaction.collector'
import { MetricsProcessor } from './processors/metrics-processor'
import { DifficultyDetector } from './processors/difficulty-detector'
import { ProgressQuery } from './queries/progress.query'
import type {
  AnalyticsEventInput,
  AnalyticsFilter,
  DailyActivity,
  ItemDifficulty,
  LearnerProfile,
  MetricSummary,
  TrendData,
} from './types'

export class AnalyticsEngine {
  private collector: InteractionCollector
  private metricsProcessor: MetricsProcessor
  private difficultyDetector: DifficultyDetector
  private progressQuery: ProgressQuery

  constructor(private readonly prisma: PrismaClient) {
    this.collector = new InteractionCollector(prisma)
    this.metricsProcessor = new MetricsProcessor(prisma)
    this.difficultyDetector = new DifficultyDetector(prisma)
    this.progressQuery = new ProgressQuery(prisma)
  }

  get interaction(): InteractionCollector { return this.collector }
  get metrics(): MetricsProcessor { return this.metricsProcessor }
  get difficulty(): DifficultyDetector { return this.difficultyDetector }
  get progress(): ProgressQuery { return this.progressQuery }

  async track(input: AnalyticsEventInput): Promise<void> {
    await this.collector.track(input)
  }

  async getEvents(filter: AnalyticsFilter): Promise<unknown[]> {
    return this.collector.getEvents({
      userId: filter.userId,
      eventType: filter.eventType,
      fromDate: filter.fromDate,
      toDate: filter.toDate,
      limit: filter.limit,
      offset: filter.offset,
    })
  }

  async getMetricSummary(userId: string): Promise<MetricSummary> {
    return this.metricsProcessor.computeMetric(userId)
  }

  async getStudentMetric(userId: string): Promise<MetricSummary | null> {
    return this.metricsProcessor.getStudentMetric(userId)
  }

  async refreshStudentMetric(userId: string): Promise<void> {
    await this.metricsProcessor.refreshStudentMetric(userId)
  }

  async getDailyActivity(userId: string, days = 30): Promise<DailyActivity[]> {
    return this.progressQuery.getDailyActivity(userId, days)
  }

  async getTrends(userId: string, days = 30): Promise<TrendData> {
    return this.progressQuery.getTrends(userId, days)
  }

  async getWeakestLetters(userId: string): Promise<ItemDifficulty[]> {
    return this.difficultyDetector.getWeakestLetters(userId)
  }

  async getWeakestNumbers(userId: string): Promise<ItemDifficulty[]> {
    return this.difficultyDetector.getWeakestNumbers(userId)
  }

  async getStrongestLetters(userId: string): Promise<ItemDifficulty[]> {
    return this.difficultyDetector.getStrongestLetters(userId)
  }

  async getStrongestNumbers(userId: string): Promise<ItemDifficulty[]> {
    return this.difficultyDetector.getStrongestNumbers(userId)
  }

  async getRecommendations(userId: string): Promise<string[]> {
    return this.progressQuery.getRecommendations(userId)
  }

  async getLearnerProfile(userId: string): Promise<LearnerProfile> {
    const [metrics, weakestLetters, weakestNumbers, strongestLetters, strongestNumbers, recentActivity, recommendations] =
      await Promise.all([
        this.getMetricSummary(userId),
        this.getWeakestLetters(userId),
        this.getWeakestNumbers(userId),
        this.getStrongestLetters(userId),
        this.getStrongestNumbers(userId),
        this.getDailyActivity(userId, 7),
        this.getRecommendations(userId),
      ])

    return {
      userId,
      metrics,
      weakestLetters,
      weakestNumbers,
      strongestLetters,
      strongestNumbers,
      recentActivity,
      recommendations,
    }
  }

  async recordAnswer(userId: string, questionId: string, answer: string, isCorrect: boolean): Promise<void> {
    await this.difficultyDetector.recordAnswer(userId, questionId, isCorrect)
    await this.refreshStudentMetric(userId)
  }

  async getStudentAnalytics(userId: string): Promise<LearnerProfile> {
    const stored = await this.prisma.studentMetric.findUnique({ where: { userId } })

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const weeklyEvents = await this.prisma.analyticsEvent.count({
      where: {
        userId,
        createdAt: { gte: weekAgo },
      },
    })

    const metricSummary = stored
      ? {
          totalGames: stored.totalGames,
          totalCorrect: stored.totalCorrect,
          totalIncorrect: stored.totalIncorrect,
          totalQuestions: stored.totalQuestions,
          accuracy: stored.accuracy,
          bestStreak: stored.bestStreak,
          currentStreak: stored.currentStreak,
          totalXp: stored.totalXp,
          totalCoins: stored.totalCoins,
          avgResponseTimeMs: stored.avgResponseTimeMs,
          gamesCompleted: stored.gamesCompleted,
        }
      : await this.getMetricSummary(userId)

    return {
      userId,
      metrics: metricSummary,
      weakestLetters: await this.getWeakestLetters(userId),
      weakestNumbers: await this.getWeakestNumbers(userId),
      strongestLetters: await this.getStrongestLetters(userId),
      strongestNumbers: await this.getStrongestNumbers(userId),
      recentActivity: await this.getDailyActivity(userId, 7),
      recommendations: await this.getRecommendations(userId),
    }
  }
}
