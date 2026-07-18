import { PrismaClient } from '@prisma/client'
import { DifficultyAdapter } from './difficulty-adapter'
import { SpacedRepetition } from './spaced-repetition'
import type { QuestionSelection } from './types'

export class ContentSelector {
  constructor(
    private prisma: PrismaClient,
    private difficultyAdapter: DifficultyAdapter,
    private spacedRepetition: SpacedRepetition,
  ) {}

  async selectNextQuestions(
    userId: string,
    lessonId: string,
    count = 10,
  ): Promise<QuestionSelection[]> {
    const difficulty = await this.difficultyAdapter.computeDifficulty(userId)
    const diffLevel = this.difficultyAdapter.getQuestionDifficulty(difficulty)
    const dueItems = await this.spacedRepetition.getDueItems(userId, count)
    const dueIds = new Set(dueItems.map((d) => d.questionId))

    const weakLetters = await this.prisma.letterDifficulty.findMany({
      where: { userId, attempts: { gte: 2 }, accuracy: { lt: 0.6 } },
      orderBy: { accuracy: 'asc' },
      take: 5,
    })
    const weakNumbers = await this.prisma.numberDifficulty.findMany({
      where: { userId, attempts: { gte: 2 }, accuracy: { lt: 0.6 } },
      orderBy: { accuracy: 'asc' },
      take: 5,
    })
    const weakAnswers = new Set([
      ...weakLetters.map((l) => l.letter),
      ...weakNumbers.map((n) => n.number),
    ])

    const questions = await this.prisma.question.findMany({
      where: {
        lessonId,
        isActive: true,
        difficulty: diffLevel,
      },
      take: count * 2,
    })

    const scored = questions.map((q) => {
      let score = 0
      if (dueIds.has(q.id)) score += 100
      if (weakAnswers.has(q.correctAnswer)) score += 50
      if (q.difficulty === diffLevel) score += 20
      return { question: q, score }
    })

    scored.sort((a, b) => b.score - a.score)

    return scored.slice(0, count).map((s, i) => ({
      questionId: s.question.id,
      difficulty: difficulty + (s.score > 50 ? 0.1 : 0),
      reason: s.score >= 100
        ? 'spaced_repetition'
        : s.score >= 50
          ? 'target_weakness'
          : 'adaptive_difficulty',
    }))
  }

  async selectQuestionsForWeakAreas(
    userId: string,
    mode: 'LETTERS' | 'NUMBERS',
    count = 5,
  ): Promise<QuestionSelection[]> {
    const weakItems = mode === 'LETTERS'
      ? await this.prisma.letterDifficulty.findMany({ where: { userId, attempts: { gte: 2 } }, orderBy: { accuracy: 'asc' }, take: 3 })
      : await this.prisma.numberDifficulty.findMany({ where: { userId, attempts: { gte: 2 } }, orderBy: { accuracy: 'asc' }, take: 3 })

    const answers = new Set(weakItems.map((w) => mode === 'LETTERS' ? (w as any).letter : (w as any).number))
    const type = mode === 'LETTERS' ? 'LETTER' : 'NUMBER'

    const questions = await this.prisma.question.findMany({
      where: {
        type: type as any,
        isActive: true,
        correctAnswer: { in: Array.from(answers) },
      },
      take: count,
    })

    return questions.map((q, i) => ({
      questionId: q.id,
      difficulty: 0.3,
      reason: 'weak_area_practice',
    }))
  }
}
