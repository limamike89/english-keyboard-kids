import { AnswerValidator } from '../questions/answer-validator'

describe('AnswerValidator', () => {
  it('should validate exact match (case insensitive)', () => {
    const v = new AnswerValidator()
    expect(v.validate('A', 'a').isCorrect).toBe(true)
    expect(v.validate('B', 'b').isCorrect).toBe(true)
  })

  it('should reject wrong answer', () => {
    const v = new AnswerValidator()
    expect(v.validate('A', 'B').isCorrect).toBe(false)
  })

  it('should trim whitespace', () => {
    const v = new AnswerValidator()
    expect(v.validate('  A  ', 'a').isCorrect).toBe(true)
  })

  it('should be case sensitive when configured', () => {
    const v = new AnswerValidator({ caseSensitive: true })
    expect(v.validate('A', 'a').isCorrect).toBe(false)
    expect(v.validate('a', 'a').isCorrect).toBe(true)
  })

  it('should return normalized values', () => {
    const v = new AnswerValidator()
    const result = v.validate('  A  ', 'b')
    expect(result.normalizedAnswer).toBe('A')
    expect(result.normalizedCorrectAnswer).toBe('B')
    expect(result.isCorrect).toBe(false)
  })

  it('should update options dynamically', () => {
    const v = new AnswerValidator({ caseSensitive: false })
    expect(v.validate('A', 'a').isCorrect).toBe(true)
    v.setOptions({ caseSensitive: true })
    expect(v.validate('A', 'a').isCorrect).toBe(false)
  })
})
