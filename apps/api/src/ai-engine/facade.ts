import { PrismaClient } from '@prisma/client'
import { DifficultyAdapter } from './difficulty-adapter'
import { SpacedRepetition } from './spaced-repetition'
import { ContentSelector } from './content-selector'
import { LearningPathPlanner } from './learning-path'
import type { QuestionSelection, LearningPathNode, AIRecommendation } from './types'

export class AIEngine {
  private difficultyAdapter: DifficultyAdapter
  private spacedRepetition: SpacedRepetition
  private contentSelector: ContentSelector
  private learningPathPlanner: LearningPathPlanner

  constructor(private readonly prisma: PrismaClient) {
    this.difficultyAdapter = new DifficultyAdapter(prisma)
    this.spacedRepetition = new SpacedRepetition(prisma)
    this.contentSelector = new ContentSelector(prisma, this.difficultyAdapter, this.spacedRepetition)
    this.learningPathPlanner = new LearningPathPlanner(prisma)
  }

  get difficulty(): DifficultyAdapter { return this.difficultyAdapter }
  get spaced(): SpacedRepetition { return this.spacedRepetition }
  get selector(): ContentSelector { return this.contentSelector }
  get path(): LearningPathPlanner { return this.learningPathPlanner }

  async getNextQuestions(userId: string, lessonId: string, count = 10): Promise<QuestionSelection[]> {
    return this.contentSelector.selectNextQuestions(userId, lessonId, count)
  }

  async getRecommendations(userId: string): Promise<AIRecommendation[]> {
    return this.learningPathPlanner.getRecommendations(userId)
  }

  async getPersonalizedPath(userId: string): Promise<LearningPathNode[]> {
    return this.learningPathPlanner.generatePath(userId)
  }

  async getDifficulty(userId: string): Promise<{ level: number; shouldIncrease: boolean; shouldDecrease: boolean }> {
    const [level, shouldIncrease, shouldDecrease] = await Promise.all([
      this.difficultyAdapter.computeDifficulty(userId),
      this.difficultyAdapter.shouldIncreaseDifficulty(userId),
      this.difficultyAdapter.shouldDecreaseDifficulty(userId),
    ])

    return { level, shouldIncrease, shouldDecrease }
  }

  async recordAnswer(
    userId: string,
    questionId: string,
    isCorrect: boolean,
    timeToAnswerMs: number,
  ): Promise<void> {
    const quality = isCorrect
      ? timeToAnswerMs < 3000 ? 5 : timeToAnswerMs < 6000 ? 4 : 3
      : timeToAnswerMs > 10000 ? 0 : 1

    await this.spacedRepetition.recordReview(userId, questionId, quality)
  }

  async getDueCount(userId: string): Promise<number> {
    return this.prisma.spacedRepetitionItem.count({
      where: { userId, nextReviewAt: { lte: new Date() } },
    })
  }

  async getWeakAreaQuestions(userId: string, mode: 'LETTERS' | 'NUMBERS', count = 5): Promise<QuestionSelection[]> {
    return this.contentSelector.selectQuestionsForWeakAreas(userId, mode, count)
  }
}
