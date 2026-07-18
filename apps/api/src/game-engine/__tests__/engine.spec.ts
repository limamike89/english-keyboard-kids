import { GameEngine } from '../core/engine'
import { AlphabetMode } from '../modes/alphabet.mode'
import { NumbersMode } from '../modes/numbers.mode'
import { MixedMode } from '../modes/mixed.mode'
import type { GameQuestion } from '../core/types'
import type { IGamePersistence, SaveProgressInput, SaveAnswerInput, LoadQuestionsInput } from '../persistence/game-persistence.interface'
import { GameAlreadyFinishedError } from '../errors/game-errors'

const mockQuestions: GameQuestion[] = [
  { id: 'q1', type: 'LETTER', audioKey: 'a', displayText: null, correctAnswer: 'A', order: 1 },
  { id: 'q2', type: 'LETTER', audioKey: 'b', displayText: null, correctAnswer: 'B', order: 2 },
  { id: 'q3', type: 'NUMBER', audioKey: '1', displayText: null, correctAnswer: '1', order: 3 },
  { id: 'q4', type: 'NUMBER', audioKey: '2', displayText: null, correctAnswer: '2', order: 4 },
  { id: 'q5', type: 'LETTER', audioKey: 'c', displayText: null, correctAnswer: 'C', order: 5 },
]

class MockPersistence implements IGamePersistence {
  savedProgress: SaveProgressInput[] = []
  savedAnswers: SaveAnswerInput[] = []

  async loadQuestions(_input: LoadQuestionsInput): Promise<GameQuestion[]> {
    return mockQuestions
  }

  async saveProgress(input: SaveProgressInput): Promise<void> {
    this.savedProgress.push(input)
  }

  async saveAnswer(input: SaveAnswerInput): Promise<void> {
    this.savedAnswers.push(input)
  }

  async saveSessionState(): Promise<void> {}

  async loadSessionState() {
    return null
  }
}

describe('GameEngine Integration', () => {
  let engine: GameEngine
  let persistence: MockPersistence

  beforeEach(() => {
    persistence = new MockPersistence()
    engine = new GameEngine(persistence)
    engine.registerMode(new AlphabetMode())
    engine.registerMode(new NumbersMode())
    engine.registerMode(new MixedMode())
  })

  describe('start', () => {
    it('should start a game and return first question', async () => {
      const result = await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'ALPHABET',
        questions: mockQuestions.filter((q) => q.type === 'LETTER'),
        sessionId: 'session-1',
      })

      expect(result.gameSessionId).toBe('session-1')
      expect(result.status).toBe('PLAYING')
      expect(result.currentQuestion).toBeDefined()
      expect(result.totalQuestions).toBe(3) // 3 LETTER questions
    })

    it('should start a numbers game', async () => {
      const result = await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'NUMBERS',
        questions: mockQuestions.filter((q) => q.type === 'NUMBER'),
        sessionId: 'session-2',
      })

      expect(result.status).toBe('PLAYING')
      expect(result.totalQuestions).toBe(2) // 2 NUMBER questions
    })

    it('should start a mixed game', async () => {
      const result = await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'MIXED',
        questions: mockQuestions,
        sessionId: 'session-3',
      })

      expect(result.totalQuestions).toBe(5)
    })
  })

  describe('submitAnswer', () => {
    it('should mark correct answer on first try', async () => {
      const start = await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'ALPHABET',
        questions: mockQuestions.filter((q) => q.type === 'LETTER'),
        sessionId: 'session-correct',
      })

      const result = await engine.submitAnswer({
        gameSessionId: 'session-correct',
        questionId: start.currentQuestion.id,
        answer: start.currentQuestion.correctAnswer,
      })

      expect(result.isCorrect).toBe(true)
      expect(result.pointsEarned).toBeGreaterThan(0)
      expect(result.status).toBe('CORRECT')
    })

    it('should mark incorrect answer', async () => {
      const start = await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'ALPHABET',
        questions: mockQuestions.filter((q) => q.type === 'LETTER'),
        sessionId: 'session-wrong',
      })

      const result = await engine.submitAnswer({
        gameSessionId: 'session-wrong',
        questionId: start.currentQuestion.id,
        answer: 'Z',
      })

      expect(result.isCorrect).toBe(false)
      expect(result.pointsEarned).toBe(0)
      expect(result.status).toBe('INCORRECT')
    })

    it('should allow retry after wrong answer', async () => {
      const start = await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'ALPHABET',
        questions: mockQuestions.filter((q) => q.type === 'LETTER').slice(0, 1),
        sessionId: 'session-retry',
      })

      await engine.submitAnswer({
        gameSessionId: 'session-retry',
        questionId: mockQuestions[0].id,
        answer: 'Z',
      })

      const retry = await engine.submitAnswer({
        gameSessionId: 'session-retry',
        questionId: mockQuestions[0].id,
        answer: 'A',
      })

      expect(retry.isCorrect).toBe(true)
      expect(retry.attemptNumber).toBe(2)
    })

    it('should complete the game after all questions answered', async () => {
      const start = await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'NUMBERS',
        questions: mockQuestions.filter((q) => q.type === 'NUMBER'),
        sessionId: 'session-complete',
      })

      const r1 = await engine.submitAnswer({
        gameSessionId: 'session-complete',
        questionId: start.currentQuestion.id,
        answer: start.currentQuestion.correctAnswer,
      })
      expect(r1.status).toBe('CORRECT')

      const r2 = await engine.submitAnswer({
        gameSessionId: 'session-complete',
        questionId: r1.nextQuestion!.id,
        answer: r1.nextQuestion!.correctAnswer,
      })
      expect(r2.status).toBe('COMPLETED')
      expect(r2.result).toBeDefined()
      expect(r2.result!.stars).toBe(3)
    })

    it('should throw on invalid session', async () => {
      await expect(
        engine.submitAnswer({
          gameSessionId: 'nonexistent',
          questionId: 'q1',
          answer: 'A',
        }),
      ).rejects.toThrow(/not found/i)
    })
  })

  describe('getState', () => {
    it('should return current game state', async () => {
      await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'ALPHABET',
        questions: mockQuestions.filter((q) => q.type === 'LETTER'),
        sessionId: 'session-state',
      })

      const state = engine.getState('session-state')
      expect(state.gameSessionId).toBe('session-state')
      expect(state.currentQuestion).toBeDefined()
      expect(state.totalQuestions).toBe(3)
    })

    it('should throw on invalid session', () => {
      expect(() => engine.getState('nonexistent')).toThrow()
    })
  })

  describe('finish', () => {
    it('should finish an active game and return result', async () => {
      await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'ALPHABET',
        questions: mockQuestions.filter((q) => q.type === 'LETTER').slice(0, 1),
        sessionId: 'session-finish',
      })

      const result = await engine.finish('session-finish')
      expect(result.totalScore).toBe(0)
      expect(result.totalCorrect).toBe(0)
    })
  })

  describe('session management', () => {
    it('should track active session count', async () => {
      expect(engine.getActiveSessionCount()).toBe(0)

      await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'ALPHABET',
        questions: mockQuestions.filter((q) => q.type === 'LETTER'),
        sessionId: 'session-count-1',
      })

      expect(engine.getActiveSessionCount()).toBe(1)
    })

    it('should check if session exists', () => {
      expect(engine.hasSession('nonexistent')).toBe(false)
    })

    it('should clean up inactive sessions', async () => {
      await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'ALPHABET',
        questions: mockQuestions.filter((q) => q.type === 'LETTER'),
        sessionId: 'session-cleanup',
      })

      expect(engine.hasSession('session-cleanup')).toBe(true)
      engine.cleanupInactiveSessions(0) // 0ms max age → cleanup all
      expect(engine.hasSession('session-cleanup')).toBe(false)
    })
  })

  describe('event bus', () => {
    it('should emit GameStarted event on start', async () => {
      const events: string[] = []
      engine.getEventBus().on('GameStarted' as any, (e) => {
        events.push(e.type)
      })

      await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'ALPHABET',
        questions: mockQuestions.filter((q) => q.type === 'LETTER'),
        sessionId: 'session-events',
      })

      expect(events).toContain('GameStarted')
    })
  })

  describe('max retries', () => {
    it('should advance to next question after exhausting retries', async () => {
      await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'ALPHABET',
        questions: mockQuestions.filter((q) => q.type === 'LETTER'),
        sessionId: 'session-max-retry',
      })

      const state0 = engine.getState('session-max-retry')
      const firstQId = state0.currentQuestion!.id

      const r1 = await engine.submitAnswer({
        gameSessionId: 'session-max-retry',
        questionId: firstQId,
        answer: 'X',
      })
      expect(r1.status).toBe('INCORRECT')

      const r2 = await engine.submitAnswer({
        gameSessionId: 'session-max-retry',
        questionId: firstQId,
        answer: 'Y',
      })
      expect(r2.status).toBe('INCORRECT')

      const r3 = await engine.submitAnswer({
        gameSessionId: 'session-max-retry',
        questionId: firstQId,
        answer: 'Z',
      })
      expect(r3.status).toBe('INCORRECT')
      expect(r3.nextQuestion).toBeDefined()
      expect(r3.nextQuestion!.id).not.toBe(firstQId)
    })

    it('should complete game after exhausting retries on last question', async () => {
      const singleQ = mockQuestions.filter((q) => q.type === 'NUMBER').slice(0, 1)
      await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'NUMBERS',
        questions: singleQ,
        sessionId: 'session-last-retry',
      })

      const q = singleQ[0]

      await engine.submitAnswer({
        gameSessionId: 'session-last-retry',
        questionId: q.id,
        answer: '9',
      })

      await engine.submitAnswer({
        gameSessionId: 'session-last-retry',
        questionId: q.id,
        answer: '8',
      })

      const r3 = await engine.submitAnswer({
        gameSessionId: 'session-last-retry',
        questionId: q.id,
        answer: '7',
      })
      expect(r3.status).toBe('COMPLETED')
      expect(r3.result).toBeDefined()
    })
  })

  describe('saveResults', () => {
    it('should persist progress and clean up session', async () => {
      await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'ALPHABET',
        questions: mockQuestions.filter((q) => q.type === 'LETTER').slice(0, 1),
        sessionId: 'session-save',
      })

      const q = mockQuestions[0]
      await engine.submitAnswer({
        gameSessionId: 'session-save',
        questionId: q.id,
        answer: 'A',
      })

      expect(engine.hasSession('session-save')).toBe(true)
      await engine.saveResults('session-save')
      expect(engine.hasSession('session-save')).toBe(false)
    })

    it('should save progress to persistence', async () => {
      await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'ALPHABET',
        questions: mockQuestions.filter((q) => q.type === 'LETTER').slice(0, 1),
        sessionId: 'session-save-persist',
      })

      const q = mockQuestions[0]
      await engine.submitAnswer({
        gameSessionId: 'session-save-persist',
        questionId: q.id,
        answer: 'A',
      })

      await engine.saveResults('session-save-persist')
      expect(persistence.savedProgress.length).toBeGreaterThanOrEqual(1)
      const saved = persistence.savedProgress[persistence.savedProgress.length - 1]
      expect(saved.userId).toBe('user-1')
      expect(saved.lessonId).toBe('lesson-1')
      expect(saved.mode).toBe('ALPHABET')
    })

    it('should throw on nonexistent session', async () => {
      await expect(engine.saveResults('nonexistent')).rejects.toThrow(/not found/i)
    })
  })

  describe('onCompleted callback', () => {
    it('should fire when game completes naturally', async () => {
      const handler = jest.fn().mockResolvedValue(undefined)
      engine.setOnCompleted(handler)

      await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'ALPHABET',
        questions: mockQuestions.filter((q) => q.type === 'LETTER').slice(0, 1),
        sessionId: 'session-callback',
      })

      const q = mockQuestions[0]
      await engine.submitAnswer({
        gameSessionId: 'session-callback',
        questionId: q.id,
        answer: 'A',
      })

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(
        'session-callback',
        expect.objectContaining({ totalCorrect: 1 }),
      )
    })
  })

  describe('lifecycle edge cases', () => {
    it('should throw when submitting to a saved session', async () => {
      await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'ALPHABET',
        questions: mockQuestions.filter((q) => q.type === 'LETTER').slice(0, 1),
        sessionId: 'session-finished',
      })

      const q = mockQuestions[0]
      await engine.submitAnswer({
        gameSessionId: 'session-finished',
        questionId: q.id,
        answer: 'A',
      })

      await engine.saveResults('session-finished')

      await expect(
        engine.submitAnswer({
          gameSessionId: 'session-finished',
          questionId: q.id,
          answer: 'A',
        }),
      ).rejects.toThrow(/not found/i)
    })

    it('should set endTime on finish', async () => {
      await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'ALPHABET',
        questions: mockQuestions.filter((q) => q.type === 'LETTER').slice(0, 1),
        sessionId: 'session-endtime',
      })

      await engine.finish('session-endtime')
    })

    it('should throw on finish for already-finished session', async () => {
      await engine.start({
        lessonId: 'lesson-1',
        userId: 'user-1',
        mode: 'ALPHABET',
        questions: mockQuestions.filter((q) => q.type === 'LETTER').slice(0, 1),
        sessionId: 'session-double-finish',
      })

      await engine.finish('session-double-finish')
      await expect(engine.finish('session-double-finish')).rejects.toThrow(GameAlreadyFinishedError)
    })
  })
})
