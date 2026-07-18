import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AIEngine } from '../../ai-engine'

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name)
  private engine: AIEngine

  constructor(private prisma: PrismaService) {
    this.engine = new AIEngine(this.prisma)
  }

  getEngine(): AIEngine {
    return this.engine
  }

  async getNextQuestions(userId: string, lessonId: string, count = 10) {
    return this.engine.getNextQuestions(userId, lessonId, count)
  }

  async getRecommendations(userId: string) {
    return this.engine.getRecommendations(userId)
  }

  async getPersonalizedPath(userId: string) {
    return this.engine.getPersonalizedPath(userId)
  }

  async getDifficulty(userId: string) {
    return this.engine.getDifficulty(userId)
  }

  async recordAnswer(userId: string, questionId: string, isCorrect: boolean, timeToAnswerMs: number) {
    await this.engine.recordAnswer(userId, questionId, isCorrect, timeToAnswerMs)
  }

  async getDueCount(userId: string) {
    return this.engine.getDueCount(userId)
  }

  async getWeakAreaQuestions(userId: string, mode: 'LETTERS' | 'NUMBERS', count = 5) {
    return this.engine.getWeakAreaQuestions(userId, mode, count)
  }
}
