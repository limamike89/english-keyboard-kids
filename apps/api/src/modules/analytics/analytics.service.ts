import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AnalyticsEngine } from '../../analytics-engine'

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name)
  private engine: AnalyticsEngine

  constructor(private prisma: PrismaService) {
    this.engine = new AnalyticsEngine(this.prisma)
  }

  getEngine(): AnalyticsEngine {
    return this.engine
  }

  async getProfile(userId: string) {
    return this.engine.getLearnerProfile(userId)
  }

  async getDashboard(userId: string) {
    const [profile, trends, metrics] = await Promise.all([
      this.engine.getLearnerProfile(userId),
      this.engine.getTrends(userId, 30),
      this.engine.getStudentMetric(userId),
    ])

    return { profile, trends, metrics }
  }

  async getTrends(userId: string, days = 30) {
    return this.engine.getTrends(userId, days)
  }

  async getDailyActivity(userId: string, days = 30) {
    return this.engine.getDailyActivity(userId, days)
  }

  async trackEvent(data: { userId?: string; sessionId?: string; eventType: string; properties?: Record<string, unknown> }) {
    await this.engine.track(data as any)
  }

  async recordAnswer(userId: string, questionId: string, isCorrect: boolean) {
    await this.engine.recordAnswer(userId, questionId, '', isCorrect)
  }

  async getWeakestLetters(userId: string) {
    return this.engine.getWeakestLetters(userId)
  }

  async getWeakestNumbers(userId: string) {
    return this.engine.getWeakestNumbers(userId)
  }

  async getRecommendations(userId: string) {
    return this.engine.getRecommendations(userId)
  }

  async refreshMetrics(userId: string) {
    await this.engine.refreshStudentMetric(userId)
  }
}
