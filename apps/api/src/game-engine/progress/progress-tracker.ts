export interface ProgressData {
  questionsAnswered: number
  totalQuestions: number
  percentage: number
  correctCount: number
  incorrectCount: number
  accuracy: number
  currentStreak: number
  bestStreak: number
  totalScore: number
  elapsedTimeMs: number
  avgTimePerQuestionMs: number
  questionStartTimes: Map<string, number>
}

export class ProgressTracker {
  private data: ProgressData

  constructor() {
    this.data = this.createInitialData()
  }

  private createInitialData(): ProgressData {
    return {
      questionsAnswered: 0,
      totalQuestions: 0,
      percentage: 0,
      correctCount: 0,
      incorrectCount: 0,
      accuracy: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalScore: 0,
      elapsedTimeMs: 0,
      avgTimePerQuestionMs: 0,
      questionStartTimes: new Map(),
    }
  }

  initialize(totalQuestions: number): void {
    this.data = this.createInitialData()
    this.data.totalQuestions = totalQuestions
  }

  startQuestion(questionId: string): void {
    this.data.questionStartTimes.set(questionId, Date.now())
  }

  recordCorrect(scoreIncrement: number): void {
    this.data.correctCount++
    this.data.questionsAnswered++
    this.data.currentStreak++
    if (this.data.currentStreak > this.data.bestStreak) {
      this.data.bestStreak = this.data.currentStreak
    }
    this.data.totalScore += scoreIncrement
    this.recalculate()
  }

  recordIncorrect(): void {
    this.data.incorrectCount++
    this.data.questionsAnswered++
    this.data.currentStreak = 0
    this.recalculate()
  }

  private recalculate(): void {
    const total = this.data.correctCount + this.data.incorrectCount
    this.data.accuracy = total > 0 ? this.data.correctCount / total : 0
    this.data.percentage =
      this.data.totalQuestions > 0
        ? (this.data.questionsAnswered / this.data.totalQuestions) * 100
        : 0
    this.data.avgTimePerQuestionMs =
      this.data.questionsAnswered > 0
        ? Math.round(this.data.elapsedTimeMs / this.data.questionsAnswered)
        : 0
  }

  setElapsedTime(ms: number): void {
    this.data.elapsedTimeMs = ms
    this.recalculate()
  }

  getData(): Readonly<ProgressData> {
    return { ...this.data }
  }

  getRemainingCount(): number {
    return this.data.totalQuestions - this.data.questionsAnswered
  }

  isComplete(): boolean {
    return this.data.questionsAnswered >= this.data.totalQuestions
  }

  reset(): void {
    this.data = this.createInitialData()
  }
}
