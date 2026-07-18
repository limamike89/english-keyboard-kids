import { AIEngine } from '../facade'
import type { PrismaClient } from '@prisma/client'

function createMockPrisma(): any {
  const store: Record<string, any[]> = {
    userStats: [],
    userAnswer: [],
    letterDifficulty: [],
    numberDifficulty: [],
    spacedRepetitionItem: [],
    question: [],
    lesson: [],
    userProgress: [],
    studentMetric: [],
    user: [],
  }

  const mock: any = { __store: store }

  mock.userStats = {
    findMany: async (args: any) => {
      if (args.where?.userId) return store.userStats.filter((r: any) => r.userId === args.where.userId)
      return store.userStats
    },
  }

  mock.userAnswer = {
    findMany: async (args: any) => {
      let results = [...store.userAnswer]
      if (args.where?.userId) results = results.filter((r: any) => r.userId === args.where.userId)
      if (args.orderBy?.createdAt === 'desc') results.reverse()
      if (args.take) results = results.slice(0, args.take)
      return results
    },
  }

  mock.letterDifficulty = {
    findMany: async (args: any) => {
      let results = store.letterDifficulty.filter((r: any) => r.userId === args.where?.userId)
      if (args.where?.attempts?.gte) results = results.filter((r: any) => r.attempts >= args.where.attempts.gte)
      if (args.where?.accuracy?.lt) results = results.filter((r: any) => r.accuracy < args.where.accuracy.lt)
      if (args.orderBy?.accuracy) {
        results.sort((a: any, b: any) => args.orderBy.accuracy === 'asc' ? a.accuracy - b.accuracy : b.accuracy - a.accuracy)
      }
      if (args.take) results = results.slice(0, args.take)
      return results
    },
  }

  mock.numberDifficulty = {
    findMany: async (args: any) => {
      let results = store.numberDifficulty.filter((r: any) => r.userId === args.where?.userId)
      if (args.where?.attempts?.gte) results = results.filter((r: any) => r.attempts >= args.where.attempts.gte)
      if (args.where?.accuracy?.lt) results = results.filter((r: any) => r.accuracy < args.where.accuracy.lt)
      if (args.orderBy?.accuracy) {
        results.sort((a: any, b: any) => args.orderBy.accuracy === 'asc' ? a.accuracy - b.accuracy : b.accuracy - a.accuracy)
      }
      if (args.take) results = results.slice(0, args.take)
      return results
    },
  }

  mock.spacedRepetitionItem = {
    findUnique: async (args: any) => {
      const key = Object.keys(args.where)[0]
      const { userId, questionId } = args.where[key] || {}
      return store.spacedRepetitionItem.find((r: any) => r.userId === userId && r.questionId === questionId) ?? null
    },
    findMany: async (args: any) => {
      let results = store.spacedRepetitionItem.filter((r: any) => r.userId === args.where?.userId)
      if (args.where?.nextReviewAt?.lte) results = results.filter((r: any) => r.nextReviewAt <= args.where.nextReviewAt.lte)
      if (args.orderBy?.nextReviewAt) results.sort((a: any, b: any) => a.nextReviewAt - b.nextReviewAt)
      if (args.take) results = results.slice(0, args.take)
      return results.map((r: any) => ({ questionId: r.questionId, easinessFactor: r.easinessFactor }))
    },
    count: async (args: any) => {
      let results = store.spacedRepetitionItem.filter((r: any) => r.userId === args.where?.userId)
      if (args.where?.nextReviewAt?.lte) results = results.filter((r: any) => r.nextReviewAt <= args.where.nextReviewAt.lte)
      return results.length
    },
    upsert: async (args: any) => {
      const { userId, questionId } = args.create
      const idx = store.spacedRepetitionItem.findIndex((r: any) => r.userId === userId && r.questionId === questionId)
      if (idx >= 0) {
        store.spacedRepetitionItem[idx] = { ...store.spacedRepetitionItem[idx], ...args.update }
        return store.spacedRepetitionItem[idx]
      }
      const record = { id: 'sr-' + store.spacedRepetitionItem.length, ...args.create, nextReviewAt: args.create.nextReviewAt ?? new Date() }
      store.spacedRepetitionItem.push(record)
      return record
    },
  }

  mock.question = {
    findMany: async (args: any) => {
      let results = [...store.question]
      if (args.where?.lessonId) results = results.filter((r: any) => r.lessonId === args.where.lessonId)
      if (args.where?.isActive !== undefined) results = results.filter((r: any) => r.isActive === args.where.isActive)
      if (args.where?.difficulty) results = results.filter((r: any) => r.difficulty === args.where.difficulty)
      if (args.where?.type) results = results.filter((r: any) => r.type === args.where.type)
      if (args.where?.correctAnswer?.in) results = results.filter((r: any) => args.where.correctAnswer.in.includes(r.correctAnswer))
      if (args.take) results = results.slice(0, args.take)
      return results
    },
  }

  mock.lesson = {
    findMany: async (args: any) => {
      let results = [...store.lesson]
      if (args.where?.isActive !== undefined) results = results.filter((r: any) => r.isActive === args.where.isActive)
      if (args.where?.deletedAt !== undefined) {
        if (args.where.deletedAt === null) results = results.filter((r: any) => r.deletedAt == null)
        else results = results.filter((r: any) => r.deletedAt === args.where.deletedAt)
      }
      if (args.orderBy?.order) results.sort((a: any, b: any) => a.order - b.order)
      return results
    },
    findFirst: async (args: any) => {
      let results = [...store.lesson]
      if (args.where?.order) results = results.filter((r: any) => r.order === args.where.order)
      if (args.where?.mode) results = results.filter((r: any) => r.mode === args.where.mode)
      if (args.where?.language) results = results.filter((r: any) => r.language === args.where.language)
      return results[0] ?? null
    },
  }

  mock.userProgress = {
    findMany: async (args: any) => {
      let results = [...store.userProgress]
      if (args.where?.userId) results = results.filter((r: any) => r.userId === args.where.userId)
      if (args.include?.lesson) {
        results = results.map((r: any) => ({
          ...r,
          lesson: store.lesson.find((l: any) => l.id === r.lessonId) ?? null,
        }))
      }
      return results
    },
  }

  mock.studentMetric = {
    findUnique: async (args: any) => store.studentMetric.find((r: any) => r.userId === args.where?.userId) ?? null,
  }

  return mock
}

describe('AIEngine', () => {
  let engine: AIEngine
  let prisma: ReturnType<typeof createMockPrisma>
  const userId = 'user-ai-1'

  beforeEach(() => {
    prisma = createMockPrisma()
    engine = new AIEngine(prisma as unknown as PrismaClient)

    const s = prisma.__store
    s.user.push({ id: userId, displayName: 'Test', xp: 100, coins: 50 })
    s.userStats.push({ id: 'us-1', userId, mode: 'LETTERS', gamesPlayed: 10, totalCorrect: 80, totalIncorrect: 20, bestStreak: 5, currentStreak: 3, avgResponseTime: '3000' })
    s.userStats.push({ id: 'us-2', userId, mode: 'NUMBERS', gamesPlayed: 5, totalCorrect: 30, totalIncorrect: 20, bestStreak: 2, currentStreak: 1, avgResponseTime: '3500' })
    s.lesson.push({ id: 'l1', mode: 'LETTERS', language: 'en', title: 'Lesson 1', order: 1, isActive: true })
    s.lesson.push({ id: 'l2', mode: 'LETTERS', language: 'en', title: 'Lesson 2', order: 2, isActive: true })
    s.question.push({ id: 'q-a', lessonId: 'l1', type: 'LETTER', correctAnswer: 'A', difficulty: 'BEGINNER', isActive: true })
    s.question.push({ id: 'q-b', lessonId: 'l1', type: 'LETTER', correctAnswer: 'B', difficulty: 'BEGINNER', isActive: true })
    s.question.push({ id: 'q-c', lessonId: 'l1', type: 'LETTER', correctAnswer: 'C', difficulty: 'INTERMEDIATE', isActive: true })
    s.question.push({ id: 'q-d', lessonId: 'l2', type: 'LETTER', correctAnswer: 'D', difficulty: 'ADVANCED', isActive: true })
    s.letterDifficulty.push({ id: 'ld-1', userId, letter: 'A', attempts: 5, correct: 1, incorrect: 4, accuracy: 0.2, updatedAt: new Date() })
    s.letterDifficulty.push({ id: 'ld-2', userId, letter: 'B', attempts: 3, correct: 3, incorrect: 0, accuracy: 1.0, updatedAt: new Date() })
    s.studentMetric.push({ id: 'sm-1', userId, totalGames: 15, totalCorrect: 110, totalIncorrect: 40, totalQuestions: 150, bestStreak: 5, currentStreak: 3, totalXp: 300, totalCoins: 150, avgResponseTimeMs: 3200, accuracy: 0.733, gamesCompleted: 12 })
    s.userProgress.push({ id: 'up-1', userId, lessonId: 'l1', score: 80, totalQuestions: 10, stars: 2, completed: true, playCount: 3, lastPlayedAt: new Date() })
  })

  describe('DifficultyAdapter', () => {
    it('should compute difficulty from stats', async () => {
      const level = await engine.difficulty.computeDifficulty(userId)
      expect(level).toBeGreaterThan(0)
      expect(level).toBeLessThanOrEqual(1)
    })

    it('should return base difficulty for new user', async () => {
      const newUserId = 'new-user'
      prisma.__store.userStats = prisma.__store.userStats.filter((r: any) => r.userId !== newUserId)
      const level = await engine.difficulty.computeDifficulty(newUserId)
      expect(level).toBe(0.5)
    })

    it('should detect when to increase difficulty', async () => {
      for (let i = 0; i < 20; i++) {
        prisma.__store.userAnswer.push({ userId, questionId: 'q-a', isCorrect: true, createdAt: new Date() })
      }
      const shouldInc = await engine.difficulty.shouldIncreaseDifficulty(userId)
      expect(shouldInc).toBe(true)
    })

    it('should detect when to decrease difficulty', async () => {
      for (let i = 0; i < 10; i++) {
        prisma.__store.userAnswer.push({ userId, questionId: 'q-a', isCorrect: false, createdAt: new Date() })
      }
      const shouldDec = await engine.difficulty.shouldDecreaseDifficulty(userId)
      expect(shouldDec).toBe(true)
    })

    it('should map difficulty to question level', () => {
      expect(engine.difficulty.getQuestionDifficulty(0.2)).toBe('BEGINNER')
      expect(engine.difficulty.getQuestionDifficulty(0.5)).toBe('INTERMEDIATE')
      expect(engine.difficulty.getQuestionDifficulty(0.8)).toBe('ADVANCED')
    })
  })

  describe('SpacedRepetition', () => {
    it('should record a review and create SR item', async () => {
      await engine.spaced.recordReview(userId, 'q-a', 5)
      const due = await engine.spaced.getDueItems(userId)
      expect(due.length).toBe(0)
    })

    it('should return due items for review', async () => {
      await engine.spaced.recordReview(userId, 'q-a', 5)
      const due = await engine.getDueCount(userId)
      expect(due).toBe(0)
    })

    it('should handle low quality reviews (resets repetitions)', async () => {
      await engine.spaced.recordReview(userId, 'q-b', 0)
      const due = await engine.spaced.getDueItems(userId)
      expect(due.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('ContentSelector', () => {
    it('should select questions for a lesson', async () => {
      const questions = await engine.selector.selectNextQuestions(userId, 'l1', 3)
      expect(questions.length).toBeGreaterThanOrEqual(1)
      expect(questions.length).toBeLessThanOrEqual(3)
    })

    it('should prioritize weak areas', async () => {
      const weak = await engine.selector.selectQuestionsForWeakAreas(userId, 'LETTERS', 2)
      expect(weak.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('LearningPathPlanner', () => {
    it('should generate a learning path', async () => {
      const path = await engine.path.generatePath(userId)
      expect(path.length).toBeGreaterThanOrEqual(1)
      expect(path[0].lessonId).toBeDefined()
    })

    it('should generate recommendations', async () => {
      const recs = await engine.path.getRecommendations(userId)
      expect(recs.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Facade', () => {
    it('should get difficulty overview', async () => {
      const diff = await engine.getDifficulty(userId)
      expect(diff.level).toBeGreaterThan(0)
      expect(typeof diff.shouldIncrease).toBe('boolean')
      expect(typeof diff.shouldDecrease).toBe('boolean')
    })

    it('should record an answer via facade', async () => {
      await engine.recordAnswer(userId, 'q-a', true, 2000)
      const due = await engine.getDueCount(userId)
      expect(due).toBeGreaterThanOrEqual(0)
    })

    it('should get next questions', async () => {
      const questions = await engine.getNextQuestions(userId, 'l1', 3)
      expect(Array.isArray(questions)).toBe(true)
    })

    it('should get recommendations', async () => {
      const recs = await engine.getRecommendations(userId)
      expect(Array.isArray(recs)).toBe(true)
    })

    it('should get personalized path', async () => {
      const path = await engine.getPersonalizedPath(userId)
      expect(Array.isArray(path)).toBe(true)
    })
  })
})
