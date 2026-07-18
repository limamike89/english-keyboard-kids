import { AlphabetMode } from '../modes/alphabet.mode'
import { NumbersMode } from '../modes/numbers.mode'
import { MixedMode } from '../modes/mixed.mode'

const mockQuestions = [
  { id: '1', audioKey: 'a', correctAnswer: 'A', type: 'LETTER' },
  { id: '2', audioKey: 'b', correctAnswer: 'B', type: 'LETTER' },
  { id: '3', audioKey: '1', correctAnswer: '1', type: 'NUMBER' },
  { id: '4', audioKey: '2', correctAnswer: '2', type: 'NUMBER' },
]

describe('AlphabetMode', () => {
  const mode = new AlphabetMode()

  it('should have correct type', () => {
    expect(mode.type).toBe('ALPHABET')
  })

  it('should filter only LETTER questions', () => {
    const qs = mode.generateQuestions(mockQuestions)
    expect(qs).toHaveLength(2)
    qs.forEach((q) => expect(q.type).toBe('LETTER'))
  })

  it('should support retry', () => {
    expect(mode.supportsRetry()).toBe(true)
  })
})

describe('NumbersMode', () => {
  const mode = new NumbersMode()

  it('should have correct type', () => {
    expect(mode.type).toBe('NUMBERS')
  })

  it('should filter only NUMBER questions', () => {
    const qs = mode.generateQuestions(mockQuestions)
    expect(qs).toHaveLength(2)
    qs.forEach((q) => expect(q.type).toBe('NUMBER'))
  })
})

describe('MixedMode', () => {
  const mode = new MixedMode()

  it('should have correct type', () => {
    expect(mode.type).toBe('MIXED')
  })

  it('should include ALL questions', () => {
    const qs = mode.generateQuestions(mockQuestions)
    expect(qs).toHaveLength(4)
  })

  it('should preserve question types', () => {
    const qs = mode.generateQuestions(mockQuestions)
    expect(qs.filter((q) => q.type === 'LETTER')).toHaveLength(2)
    expect(qs.filter((q) => q.type === 'NUMBER')).toHaveLength(2)
  })
})

describe('BaseGameMode', () => {
  it('should validate answers case-insensitively', () => {
    const mode = new AlphabetMode()
    expect(mode.validateAnswer('A', 'a')).toBe(true)
    expect(mode.validateAnswer('  A  ', 'a')).toBe(true)
    expect(mode.validateAnswer('B', 'A')).toBe(false)
  })
})
