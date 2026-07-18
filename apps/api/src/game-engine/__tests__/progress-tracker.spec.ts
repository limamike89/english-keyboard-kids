import { ProgressTracker } from '../progress/progress-tracker'

describe('ProgressTracker', () => {
  it('should initialize with zero values', () => {
    const t = new ProgressTracker()
    const d = t.getData()
    expect(d.questionsAnswered).toBe(0)
    expect(d.totalQuestions).toBe(0)
  })

  it('should track correct answers', () => {
    const t = new ProgressTracker()
    t.initialize(10)
    t.recordCorrect(10)
    const d = t.getData()
    expect(d.correctCount).toBe(1)
    expect(d.currentStreak).toBe(1)
    expect(d.bestStreak).toBe(1)
    expect(d.totalScore).toBe(10)
  })

  it('should track incorrect answers and reset streak', () => {
    const t = new ProgressTracker()
    t.initialize(10)
    t.recordCorrect(10)
    t.recordIncorrect()
    const d = t.getData()
    expect(d.correctCount).toBe(1)
    expect(d.incorrectCount).toBe(1)
    expect(d.currentStreak).toBe(0)
    expect(d.bestStreak).toBe(1)
  })

  it('should calculate percentage', () => {
    const t = new ProgressTracker()
    t.initialize(4)
    t.recordCorrect(10)
    t.recordCorrect(10)
    expect(t.getData().percentage).toBe(50)
  })

  it('should calculate accuracy', () => {
    const t = new ProgressTracker()
    t.initialize(10)
    t.recordCorrect(10)
    t.recordCorrect(10)
    t.recordIncorrect()
    expect(t.getData().accuracy).toBeCloseTo(2 / 3)
  })

  it('should return remaining count', () => {
    const t = new ProgressTracker()
    t.initialize(10)
    t.recordCorrect(10)
    expect(t.getRemainingCount()).toBe(9)
  })

  it('should detect completion', () => {
    const t = new ProgressTracker()
    t.initialize(2)
    t.recordCorrect(10)
    t.recordCorrect(10)
    expect(t.isComplete()).toBe(true)
  })

  it('should reset', () => {
    const t = new ProgressTracker()
    t.initialize(10)
    t.recordCorrect(10)
    t.reset()
    expect(t.getData().questionsAnswered).toBe(0)
  })

  it('should track question start times', () => {
    const t = new ProgressTracker()
    t.initialize(10)
    t.startQuestion('q1')
    expect(t.getData().questionStartTimes.has('q1')).toBe(true)
  })
})
