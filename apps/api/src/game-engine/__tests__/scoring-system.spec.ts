import { ScoringSystem } from '../scoring/scoring-system'

describe('ScoringSystem', () => {
  describe('calculatePoints', () => {
    it('should return 10 for first attempt', () => {
      expect(new ScoringSystem().calculatePoints(1)).toBe(10)
    })

    it('should return 7 for second attempt', () => {
      expect(new ScoringSystem().calculatePoints(2)).toBe(7)
    })

    it('should return 5 for third attempt', () => {
      expect(new ScoringSystem().calculatePoints(3)).toBe(5)
    })

    it('should return 3 for fourth+ attempt', () => {
      const s = new ScoringSystem()
      expect(s.calculatePoints(4)).toBe(3)
      expect(s.calculatePoints(10)).toBe(3)
    })
  })

  describe('calculateStreakBonus', () => {
    it('should return 0 when not on bonus threshold', () => {
      expect(new ScoringSystem().calculateStreakBonus(3)).toBe(0)
    })

    it('should return bonus on every 5th streak', () => {
      const s = new ScoringSystem()
      expect(s.calculateStreakBonus(5)).toBe(3)
      expect(s.calculateStreakBonus(10)).toBe(3)
    })
  })

  describe('calculateStars', () => {
    it('should return 0 for accuracy below 50%', () => {
      expect(new ScoringSystem().calculateStars(0.3)).toBe(0)
    })

    it('should return 1 for accuracy >= 50%', () => {
      expect(new ScoringSystem().calculateStars(0.5)).toBe(1)
    })

    it('should return 2 for accuracy >= 75%', () => {
      expect(new ScoringSystem().calculateStars(0.8)).toBe(2)
    })

    it('should return 3 for accuracy >= 100%', () => {
      expect(new ScoringSystem().calculateStars(1.0)).toBe(3)
    })
  })

  describe('calculateXp', () => {
    it('should return 0 for 0 stars', () => {
      expect(new ScoringSystem().calculateXp(0)).toBe(0)
    })

    it('should return correct XP per star', () => {
      const s = new ScoringSystem()
      expect(s.calculateXp(1)).toBe(20)
      expect(s.calculateXp(2)).toBe(40)
      expect(s.calculateXp(3)).toBe(60)
    })
  })

  describe('calculateCoins', () => {
    it('should return 0 for 0 stars', () => {
      expect(new ScoringSystem().calculateCoins(0)).toBe(0)
    })

    it('should return correct coins per star', () => {
      const s = new ScoringSystem()
      expect(s.calculateCoins(1)).toBe(5)
      expect(s.calculateCoins(2)).toBe(10)
      expect(s.calculateCoins(3)).toBe(15)
    })
  })

  describe('buildResult', () => {
    it('should create valid GameResult with stars', () => {
      const s = new ScoringSystem()
      const result = s.buildResult({
        totalScore: 100,
        totalCorrect: 8,
        totalIncorrect: 2,
        bestStreak: 5,
        totalTimeMs: 60000,
        avgTimePerQuestionMs: 6000,
      })
      expect(result.totalScore).toBe(100)
      expect(result.stars).toBe(2)
      expect(result.xpEarned).toBe(40)
      expect(result.accuracy).toBe(0.8)
    })

    it('should handle zero questions', () => {
      const s = new ScoringSystem()
      const result = s.buildResult({
        totalScore: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        bestStreak: 0,
        totalTimeMs: 0,
        avgTimePerQuestionMs: 0,
      })
      expect(result.accuracy).toBe(0)
      expect(result.stars).toBe(0)
    })
  })

  describe('custom config', () => {
    it('should use custom points', () => {
      const s = new ScoringSystem({ pointsPerAttempt: [5, 3, 1, 0] })
      expect(s.calculatePoints(1)).toBe(5)
      expect(s.calculatePoints(4)).toBe(0)
    })

    it('should update config at runtime', () => {
      const s = new ScoringSystem()
      s.updateConfig({ streakBonusPoints: 10 })
      expect(s.calculateStreakBonus(5)).toBe(10)
    })
  })
})
