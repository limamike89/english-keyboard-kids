import { PrismaClient } from '@prisma/client'
import type { ItemDifficulty } from '../types'

export class DifficultyDetector {
  constructor(private prisma: PrismaClient) {}

  async recordAnswer(
    userId: string,
    questionId: string,
    isCorrect: boolean,
  ): Promise<void> {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: { correctAnswer: true, type: true },
    })
    if (!question) return

    const value = question.correctAnswer.toUpperCase()
    const table = question.type === 'LETTER' ? 'letterDifficulty' : 'numberDifficulty'
    const uniqueField = question.type === 'LETTER' ? 'letter' : 'number'
    const compoundKey = `userId_${uniqueField}`

    const existing = await (this.prisma as any)[table].findUnique({
      where: { [compoundKey]: { userId, [uniqueField]: value } },
    })

    const attempts = (existing?.attempts ?? 0) + 1
    const correct = (existing?.correct ?? 0) + (isCorrect ? 1 : 0)
    const incorrect = (existing?.incorrect ?? 0) + (isCorrect ? 0 : 1)
    const accuracy = correct / attempts

    await (this.prisma as any)[table].upsert({
      where: { [compoundKey]: { userId, [uniqueField]: value } },
      create: { userId, [uniqueField]: value, attempts, correct, incorrect, accuracy },
      update: { attempts, correct, incorrect, accuracy },
    })
  }

  async getWeakestLetters(userId: string, limit = 5): Promise<ItemDifficulty[]> {
    return this.getDifficulties(userId, 'letterDifficulty', 'letter', true, limit)
  }

  async getWeakestNumbers(userId: string, limit = 5): Promise<ItemDifficulty[]> {
    return this.getDifficulties(userId, 'numberDifficulty', 'number', true, limit)
  }

  async getStrongestLetters(userId: string, limit = 5): Promise<ItemDifficulty[]> {
    return this.getDifficulties(userId, 'letterDifficulty', 'letter', false, limit)
  }

  async getStrongestNumbers(userId: string, limit = 5): Promise<ItemDifficulty[]> {
    return this.getDifficulties(userId, 'numberDifficulty', 'number', false, limit)
  }

  private async getDifficulties(
    userId: string,
    table: string,
    field: string,
    weakest: boolean,
    limit: number,
  ): Promise<ItemDifficulty[]> {
    const rows = await (this.prisma as any)[table].findMany({
      where: { userId, attempts: { gte: 2 } },
      orderBy: { accuracy: weakest ? 'asc' : 'desc' },
      take: limit,
    })

    return rows.map((r: Record<string, unknown>) => ({
      item: r[field] as string,
      attempts: r.attempts as number,
      correct: r.correct as number,
      incorrect: r.incorrect as number,
      accuracy: r.accuracy as number,
    }))
  }

  async getAllLetterDifficulties(userId: string): Promise<ItemDifficulty[]> {
    return this.getAllDifficulties(userId, 'letterDifficulty', 'letter')
  }

  async getAllNumberDifficulties(userId: string): Promise<ItemDifficulty[]> {
    return this.getAllDifficulties(userId, 'numberDifficulty', 'number')
  }

  private async getAllDifficulties(
    userId: string,
    table: string,
    field: string,
  ): Promise<ItemDifficulty[]> {
    const rows = await (this.prisma as any)[table].findMany({
      where: { userId },
      orderBy: { accuracy: 'asc' },
    })

    return rows.map((r: Record<string, unknown>) => ({
      item: r[field] as string,
      attempts: r.attempts as number,
      correct: r.correct as number,
      incorrect: r.incorrect as number,
      accuracy: r.accuracy as number,
    }))
  }
}
