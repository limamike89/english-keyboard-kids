import { PrismaClient } from '@prisma/client'

export class SpacedRepetition {
  constructor(private prisma: PrismaClient) {}

  async recordReview(
    userId: string,
    questionId: string,
    quality: number, // 0-5 (0=complete blackout, 5=perfect recall)
  ): Promise<void> {
    const existing = await this.prisma.spacedRepetitionItem.findUnique({
      where: { userId_questionId: { userId, questionId } },
    })

    let ef = existing?.easinessFactor ?? 2.5
    let interval = existing?.interval ?? 0
    let repetitions = existing?.repetitions ?? 0

    ef = this.calculateEasinessFactor(ef, quality)

    if (quality >= 3) {
      if (repetitions === 0) interval = 1
      else if (repetitions === 1) interval = 6
      else interval = Math.round((existing?.interval ?? 0) * ef)

      repetitions++
    } else {
      repetitions = 0
      interval = 1
    }

    const nextReviewAt = new Date()
    nextReviewAt.setDate(nextReviewAt.getDate() + interval)

    await this.prisma.spacedRepetitionItem.upsert({
      where: { userId_questionId: { userId, questionId } },
      create: {
        userId,
        questionId,
        easinessFactor: ef,
        interval,
        repetitions,
        nextReviewAt,
        lastReviewedAt: new Date(),
        correctCount: quality >= 3 ? 1 : 0,
        incorrectCount: quality < 3 ? 1 : 0,
      },
      update: {
        easinessFactor: ef,
        interval,
        repetitions,
        nextReviewAt,
        lastReviewedAt: new Date(),
        correctCount: { increment: quality >= 3 ? 1 : 0 },
        incorrectCount: { increment: quality < 3 ? 1 : 0 },
      },
    })
  }

  async getDueItems(userId: string, limit = 20): Promise<Array<{ questionId: string; easinessFactor: number }>> {
    const items = await this.prisma.spacedRepetitionItem.findMany({
      where: {
        userId,
        nextReviewAt: { lte: new Date() },
      },
      orderBy: { nextReviewAt: 'asc' },
      take: limit,
    })

    return items.map((i) => ({ questionId: i.questionId, easinessFactor: i.easinessFactor }))
  }

  async getItemsForLesson(userId: string, lessonId: string): Promise<Array<{ questionId: string; interval: number; nextReviewAt: Date }>> {
    const questions = await this.prisma.question.findMany({
      where: { lessonId, isActive: true },
      select: { id: true },
    })

    const questionIds = questions.map((q) => q.id)
    const items = await this.prisma.spacedRepetitionItem.findMany({
      where: { userId, questionId: { in: questionIds } },
      select: { questionId: true, interval: true, nextReviewAt: true },
    })

    return items
  }

  private calculateEasinessFactor(oldEF: number, quality: number): number {
    const newEF = oldEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    return Math.max(1.3, newEF)
  }
}
