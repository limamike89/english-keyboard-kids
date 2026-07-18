import { GameQuestion } from '../core/types'

export type ShuffleAlgorithm = (questions: GameQuestion[]) => GameQuestion[]

function fisherYatesShuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export class QuestionPool {
  private originalQuestions: GameQuestion[] = []
  private remaining: GameQuestion[] = []
  private answered: Set<string> = new Set()
  private shuffleAlgorithm: ShuffleAlgorithm

  constructor(shuffleAlgorithm?: ShuffleAlgorithm) {
    this.shuffleAlgorithm = shuffleAlgorithm ?? fisherYatesShuffle
  }

  initialize(questions: GameQuestion[]): void {
    const orderedQuestions = this.shuffleAlgorithm([...questions])
    this.originalQuestions = orderedQuestions
    this.remaining = [...orderedQuestions]
    this.answered = new Set()
  }

  hasNext(): boolean {
    return this.remaining.length > 0
  }

  next(): GameQuestion | null {
    const next = this.remaining.shift()
    if (next) {
      this.answered.add(next.id)
    }
    return next ?? null
  }

  peek(): GameQuestion | null {
    return this.remaining[0] ?? null
  }

  getRemainingCount(): number {
    return this.remaining.length
  }

  getAnsweredCount(): number {
    return this.answered.size
  }

  getTotalCount(): number {
    return this.originalQuestions.length
  }

  isAnswered(questionId: string): boolean {
    return this.answered.has(questionId)
  }

  reset(): void {
    this.remaining = []
    this.answered = new Set()
  }

  setShuffleAlgorithm(algorithm: ShuffleAlgorithm): void {
    this.shuffleAlgorithm = algorithm
  }

  getAll(): GameQuestion[] {
    return [...this.originalQuestions]
  }
}
