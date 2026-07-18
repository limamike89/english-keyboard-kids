import { AnalyticsEngine } from '../facade'
import type { PrismaClient } from '@prisma/client'

function createMockPrisma(): any {
  const store: Record<string, any[]> = {
    analyticsEvent: [],
    studentMetric: [],
    letterDifficulty: [],
    numberDifficulty: [],
    userStats: [],
    user: [],
    question: [],
  }

  const mock: any = {
    __store: store,
    analyticsEvent: {
      create: async (args: any) => {
        const record = { id: 'evt-' + store.analyticsEvent.length, ...args.data, createdAt: new Date() }
        store.analyticsEvent.push(record)
        return record
      },
      findMany: async (args: any) => {
        let results = [...store.analyticsEvent] as any[]
        if (args.where?.userId) results = results.filter((r: any) => r.userId === args.where.userId)
        if (args.where?.eventType && typeof args.where.eventType === 'string') {
          results = results.filter((r: any) => r.eventType === args.where.eventType)
        }
        if (args.where?.eventType?.in) results = results.filter((r: any) => args.where.eventType.in.includes(r.eventType))
        if (args.where?.createdAt?.gte) results = results.filter((r: any) => r.createdAt >= args.where.createdAt.gte)
        if (args.where?.createdAt?.lte) results = results.filter((r: any) => r.createdAt <= args.where.createdAt.lte)
        results.sort((a: any, b: any) => b.createdAt - a.createdAt)
        if (args.take) results = results.slice(0, args.take)
        if (args.skip) results = results.slice(args.skip)
        if (args.select) {
          results = results.map((r: any) => {
            const selected: Record<string, any> = {}
            for (const key of Object.keys(args.select)) {
              selected[key] = r[key]
            }
            return selected
          })
        }
        return results
      },
      count: async (args: any) => {
        let results = [...store.analyticsEvent] as any[]
        if (args.where?.userId) results = results.filter((r: any) => r.userId === args.where.userId)
        if (args.where?.createdAt?.gte) results = results.filter((r: any) => r.createdAt >= args.where.createdAt.gte)
        return results.length
      },
    },
    studentMetric: {
      findUnique: async (args: any) => store.studentMetric.find((r: any) => r.userId === args.where.userId) ?? null,
      upsert: async (args: any) => {
        const idx = store.studentMetric.findIndex((r: any) => r.userId === args.where.userId)
        if (idx >= 0) {
          store.studentMetric[idx] = { ...store.studentMetric[idx], ...args.update }
          return store.studentMetric[idx]
        }
        const record = { id: 'sm-' + store.studentMetric.length, ...args.create }
        store.studentMetric.push(record)
        return record
      },
    },
    letterDifficulty: {
      findUnique: async (args: any) => {
        const key = Object.keys(args.where)[0]
        const { userId, letter } = args.where[key] || {}
        return store.letterDifficulty.find((r: any) => r.userId === userId && r.letter === letter) ?? null
      },
      findMany: async (args: any) => {
        let results = store.letterDifficulty.filter((r: any) => r.userId === args.where?.userId)
        if (args.where?.attempts?.gte) results = results.filter((r: any) => r.attempts >= args.where.attempts.gte)
        if (args.orderBy?.accuracy) {
          results.sort((a: any, b: any) => args.orderBy.accuracy === 'asc' ? a.accuracy - b.accuracy : b.accuracy - a.accuracy)
        }
        if (args.take) results = results.slice(0, args.take)
        return results
      },
      upsert: async (args: any) => {
        const { userId, letter } = args.create
        const idx = store.letterDifficulty.findIndex((r: any) => r.userId === userId && r.letter === letter)
        if (idx >= 0) {
          store.letterDifficulty[idx] = { ...store.letterDifficulty[idx], ...args.update }
          return store.letterDifficulty[idx]
        }
        const record = { id: 'ld-' + store.letterDifficulty.length, ...args.create }
        store.letterDifficulty.push(record)
        return record
      },
    },
    numberDifficulty: {
      findUnique: async (args: any) => {
        const key = Object.keys(args.where)[0]
        const { userId, number } = args.where[key] || {}
        return store.numberDifficulty.find((r: any) => r.userId === userId && r.number === number) ?? null
      },
      findMany: async (args: any) => {
        let results = store.numberDifficulty.filter((r: any) => r.userId === args.where?.userId)
        if (args.where?.attempts?.gte) results = results.filter((r: any) => r.attempts >= args.where.attempts.gte)
        if (args.orderBy?.accuracy) {
          results.sort((a: any, b: any) => args.orderBy.accuracy === 'asc' ? a.accuracy - b.accuracy : b.accuracy - a.accuracy)
        }
        if (args.take) results = results.slice(0, args.take)
        return results
      },
      upsert: async (args: any) => {
        const { userId, number } = args.create
        const idx = store.numberDifficulty.findIndex((r: any) => r.userId === userId && r.number === number)
        if (idx >= 0) {
          store.numberDifficulty[idx] = { ...store.numberDifficulty[idx], ...args.update }
          return store.numberDifficulty[idx]
        }
        const record = { id: 'nd-' + store.numberDifficulty.length, ...args.create }
        store.numberDifficulty.push(record)
        return record
      },
    },
    userStats: {
      findMany: async (args: any) => {
        if (args.where?.userId) {
          return store.userStats.filter((r: any) => r.userId === args.where.userId)
        }
        return store.userStats
      },
    },
    user: {
      findUnique: async (args: any) => store.user.find((r: any) => r.id === args.where?.id) ?? null,
    },
    question: {
      findUnique: async (args: any) => store.question.find((r: any) => r.id === args.where?.id) ?? null,
    },
    $disconnect: async () => {},
  }
  return mock
}

describe('AnalyticsEngine', () => {
  let engine: AnalyticsEngine
  let prisma: ReturnType<typeof createMockPrisma>

  const userId = 'user-test-1'

  beforeEach(() => {
    prisma = createMockPrisma()
    engine = new AnalyticsEngine(prisma as unknown as PrismaClient)

    const s = prisma.__store
    s.user.push({ id: userId, displayName: 'Test', isAnonymous: true, xp: 150, coins: 80 })
    s.userStats.push({ id: 'us-1', userId, mode: 'LETTERS', gamesPlayed: 5, totalCorrect: 40, totalIncorrect: 10, bestStreak: 8, currentStreak: 2, avgResponseTime: '2500', xpEarned: 100, coinsEarned: 50 })
    s.question.push({
      id: 'q-a',
      lessonId: 'l1',
      type: 'LETTER',
      prompt: 'Type A',
      correctAnswer: 'A',
      displayOrder: 1,
      options: [],
    })
    s.question.push({
      id: 'q-b',
      lessonId: 'l1',
      type: 'LETTER',
      prompt: 'Type B',
      correctAnswer: 'B',
      displayOrder: 2,
      options: [],
    })
    s.question.push({
      id: 'q-1',
      lessonId: 'l1',
      type: 'NUMBER',
      prompt: 'Type 1',
      correctAnswer: '1',
      displayOrder: 1,
      options: [],
    })
  })

  describe('InteractionCollector', () => {
    it('should track an event', async () => {
      await engine.track({ userId, eventType: 'game_started', properties: { mode: 'LETTERS' } })
      const events = await engine.getEvents({ userId })
      expect(events).toHaveLength(1)
      expect(events[0]).toMatchObject({ eventType: 'game_started' })
    })

    it('should track multiple events and filter by type', async () => {
      await engine.track({ userId, eventType: 'game_started' })
      await engine.track({ userId, eventType: 'game_completed', properties: { score: 100 } })
      await engine.track({ userId, eventType: 'answer_correct' })

      const started = await engine.getEvents({ userId, eventType: 'game_started' })
      expect(started).toHaveLength(1)

      const all = await engine.getEvents({ userId })
      expect(all).toHaveLength(3)
    })

    it('should track specific game events', async () => {
      await engine.interaction.trackGameStarted(userId, 'session-1', 'LETTERS')
      await engine.interaction.trackGameCompleted(userId, 'session-1', 100, 8, 2)

      const events = await engine.getEvents({ userId })
      expect(events).toHaveLength(2)
    })

    it('should track navigation', async () => {
      await engine.interaction.trackNavigation(userId, '/home', '/game')
      const events = await engine.getEvents({ userId, eventType: 'navigation' })
      expect(events).toHaveLength(1)
    })
  })

  describe('MetricsProcessor', () => {
    it('should compute metric summary from userStats', async () => {
      const metric = await engine.getMetricSummary(userId)
      expect(metric.totalGames).toBe(5)
      expect(metric.totalCorrect).toBe(40)
      expect(metric.totalIncorrect).toBe(10)
      expect(metric.totalQuestions).toBe(50)
      expect(metric.accuracy).toBe(0.8)
      expect(metric.totalXp).toBe(150)
      expect(metric.totalCoins).toBe(80)
    })

    it('should refresh and retrieve student metric', async () => {
      await engine.refreshStudentMetric(userId)
      const stored = await engine.getStudentMetric(userId)
      expect(stored).not.toBeNull()
      expect(stored!.totalCorrect).toBe(40)
    })
  })

  describe('DifficultyDetector', () => {
    it('should record letter answers and compute difficulty', async () => {
      await engine.difficulty.recordAnswer(userId, 'q-a', true)
      await engine.difficulty.recordAnswer(userId, 'q-a', true)
      await engine.difficulty.recordAnswer(userId, 'q-a', false)

      const weakest = await engine.getWeakestLetters(userId)
      expect(weakest).toHaveLength(1)
      expect(weakest[0].item).toBe('A')
      expect(weakest[0].attempts).toBe(3)
      expect(weakest[0].accuracy).toBeCloseTo(2 / 3)
    })

    it('should track multiple letters and identify weakest', async () => {
      await engine.difficulty.recordAnswer(userId, 'q-a', true)
      await engine.difficulty.recordAnswer(userId, 'q-a', true)
      await engine.difficulty.recordAnswer(userId, 'q-b', false)
      await engine.difficulty.recordAnswer(userId, 'q-b', false)

      const weakest = await engine.getWeakestLetters(userId)
      expect(weakest).toHaveLength(2)
      expect(weakest[0].item).toBe('B')
    })

    it('should record number answers', async () => {
      await engine.difficulty.recordAnswer(userId, 'q-1', true)
      await engine.difficulty.recordAnswer(userId, 'q-1', false)

      const weakest = await engine.getWeakestNumbers(userId)
      expect(weakest).toHaveLength(1)
      expect(weakest[0].item).toBe('1')
    })

    it('should ignore difficulties with fewer than 2 attempts', async () => {
      await engine.difficulty.recordAnswer(userId, 'q-a', true)

      const weakest = await engine.getWeakestLetters(userId)
      expect(weakest).toHaveLength(0)
    })
  })

  describe('ProgressQuery', () => {
    it('should return daily activity', async () => {
      await engine.track({ userId, eventType: 'answer_correct' })
      await engine.track({ userId, eventType: 'answer_incorrect' })

      const activity = await engine.getDailyActivity(userId, 7)
      expect(activity.length).toBeGreaterThanOrEqual(1)
      expect(activity[0].correct).toBe(1)
      expect(activity[0].incorrect).toBe(1)
    })

    it('should return recommendations when weak letters exist', async () => {
      await engine.difficulty.recordAnswer(userId, 'q-b', false)
      await engine.difficulty.recordAnswer(userId, 'q-b', false)

      const recs = await engine.getRecommendations(userId)
      expect(recs.length).toBeGreaterThan(0)
      expect(recs[0]).toContain('letter')
    })
  })

  describe('LearnerProfile', () => {
    it('should build a complete learner profile', async () => {
      await engine.track({ userId, eventType: 'answer_correct' })
      await engine.difficulty.recordAnswer(userId, 'q-a', true)
      await engine.difficulty.recordAnswer(userId, 'q-a', true)
      await engine.difficulty.recordAnswer(userId, 'q-b', false)
      await engine.difficulty.recordAnswer(userId, 'q-b', false)

      const profile = await engine.getLearnerProfile(userId)
      expect(profile.userId).toBe(userId)
      expect(profile.metrics).toBeDefined()
      expect(profile.metrics.totalGames).toBe(5)
      expect(profile.weakestLetters.length).toBeGreaterThan(0)
      expect(profile.recommendations.length).toBeGreaterThan(0)
    })
  })
})
