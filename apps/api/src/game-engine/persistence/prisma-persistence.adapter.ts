import { PrismaClient } from '@prisma/client'
import { IGamePersistence, SaveProgressInput, SaveAnswerInput, LoadQuestionsInput } from './game-persistence.interface'
import { GameQuestion, GameSessionState, GameState } from '../core/types'

export class PrismaPersistenceAdapter implements IGamePersistence {
  constructor(private readonly prisma: PrismaClient) {}

  async loadQuestions(input: LoadQuestionsInput): Promise<GameQuestion[]> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: input.lessonId },
      include: {
        questions: {
          where: { isActive: true, deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!lesson) return []

    return lesson.questions.map((q) => ({
      id: q.id,
      type: q.type as 'LETTER' | 'NUMBER',
      audioKey: q.audioKey,
      displayText: q.displayText,
      correctAnswer: q.correctAnswer,
      order: q.order,
      difficulty: q.difficulty,
      hint: q.hint,
    }))
  }

  async saveProgress(input: SaveProgressInput): Promise<void> {
    const accuracy =
      input.totalCorrect + input.totalIncorrect > 0
        ? input.totalCorrect / (input.totalCorrect + input.totalIncorrect)
        : 0

    let stars = 0
    if (accuracy >= 1) stars = 3
    else if (accuracy >= 0.7) stars = 2
    else if (accuracy >= 0.5) stars = 1

    await this.prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: input.userId,
          lessonId: input.lessonId,
        },
      },
      create: {
        userId: input.userId,
        lessonId: input.lessonId,
        score: input.score,
        totalQuestions: input.totalQuestions,
        correctFirstTry: 0,
        stars,
        bestStreak: input.bestStreak,
        completed: input.completed,
        completedAt: input.completed ? new Date() : null,
        playCount: 1,
        lastPlayedAt: new Date(),
      },
      update: {
        score: { increment: input.score },
        stars: Math.max(stars, 0),
        bestStreak: Math.max(input.bestStreak, 0),
        completed: input.completed ? true : undefined,
        completedAt: input.completed ? new Date() : undefined,
        playCount: { increment: 1 },
        lastPlayedAt: new Date(),
      },
    })

    await this.prisma.userStats.upsert({
      where: {
        userId_mode: {
          userId: input.userId,
          mode: input.mode as 'LETTERS' | 'NUMBERS' | 'MIXED',
        },
      },
      create: {
        userId: input.userId,
        mode: input.mode as 'LETTERS' | 'NUMBERS' | 'MIXED',
        gamesPlayed: 1,
        totalScore: input.score,
        totalCorrect: input.totalCorrect,
        totalIncorrect: input.totalIncorrect,
        totalQuestions: input.totalQuestions,
        bestStreak: input.bestStreak,
        currentStreak: 0,
        avgResponseTime: null,
        lastPlayedAt: new Date(),
      },
      update: {
        gamesPlayed: { increment: 1 },
        totalScore: { increment: input.score },
        totalCorrect: { increment: input.totalCorrect },
        totalIncorrect: { increment: input.totalIncorrect },
        totalQuestions: { increment: input.totalQuestions },
        bestStreak: Math.max(input.bestStreak, 0),
        lastPlayedAt: new Date(),
      },
    })
  }

  async saveAnswer(input: SaveAnswerInput): Promise<void> {
    await this.prisma.userAnswer.create({
      data: {
        userId: input.userId,
        questionId: input.questionId,
        lessonId: input.lessonId,
        answer: input.answer,
        isCorrect: input.isCorrect,
        attemptNumber: input.attemptNumber,
      },
    })
  }

  async saveSessionState(_state: GameSessionState): Promise<void> {
    // Future Redis implementation
  }

  async loadSessionState(_sessionId: string): Promise<GameSessionState | null> {
    return null // Future Redis implementation
  }
}
