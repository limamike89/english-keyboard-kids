import { QuestionPool } from '../questions/question-pool'
import type { GameQuestion } from '../core/types'

const makeQuestion = (id: string): GameQuestion => ({
  id,
  type: 'LETTER',
  audioKey: `audio_${id}`,
  displayText: null,
  correctAnswer: id.toUpperCase(),
  order: 1,
})

describe('QuestionPool', () => {
  it('should initialize with questions', () => {
    const pool = new QuestionPool()
    pool.initialize([makeQuestion('a'), makeQuestion('b')])
    expect(pool.getTotalCount()).toBe(2)
  })

  it('should return next question', () => {
    const pool = new QuestionPool()
    pool.initialize([makeQuestion('a')])
    expect(pool.next()?.id).toBeDefined()
  })

  it('should not repeat questions', () => {
    const pool = new QuestionPool()
    const qs = [makeQuestion('a'), makeQuestion('b'), makeQuestion('c')]
    pool.initialize(qs)
    const answered = new Set<string>()
    while (pool.hasNext()) {
      const q = pool.next()
      expect(answered.has(q!.id)).toBe(false)
      answered.add(q!.id)
    }
    expect(answered.size).toBe(3)
  })

  it('should return null when exhausted', () => {
    const pool = new QuestionPool()
    pool.initialize([makeQuestion('a')])
    pool.next()
    expect(pool.hasNext()).toBe(false)
    expect(pool.next()).toBeNull()
  })

  it('should report remaining count', () => {
    const pool = new QuestionPool()
    pool.initialize([makeQuestion('a'), makeQuestion('b'), makeQuestion('c')])
    expect(pool.getRemainingCount()).toBe(3)
    pool.next()
    expect(pool.getRemainingCount()).toBe(2)
  })

  it('should report answered count', () => {
    const pool = new QuestionPool()
    pool.initialize([makeQuestion('a'), makeQuestion('b')])
    pool.next()
    expect(pool.getAnsweredCount()).toBe(1)
  })

  it('should check if question is answered', () => {
    const pool = new QuestionPool()
    const q = makeQuestion('a')
    pool.initialize([q])
    pool.next()
    expect(pool.isAnswered(q.id)).toBe(true)
  })

  it('should reset', () => {
    const pool = new QuestionPool()
    pool.initialize([makeQuestion('a')])
    pool.next()
    pool.reset()
    expect(pool.getRemainingCount()).toBe(0)
  })

  it('should peek without consuming', () => {
    const pool = new QuestionPool()
    const q = makeQuestion('x')
    pool.initialize([q])
    expect(pool.peek()?.id).toBe(q.id)
    expect(pool.getRemainingCount()).toBe(1)
  })

  it('should use custom shuffle algorithm', () => {
    const pool = new QuestionPool()
    const qs = [makeQuestion('a'), makeQuestion('b'), makeQuestion('c')]
    pool.setShuffleAlgorithm((questions) => [...questions].reverse())
    pool.initialize(qs)
    expect(pool.peek()?.id).toBe('c')
  })
})
