import { PrismaClient } from '@prisma/client'
import type { LearningPathNode, AIRecommendation } from './types'

export class LearningPathPlanner {
  constructor(private prisma: PrismaClient) {}

  async generatePath(userId: string, limit = 10): Promise<LearningPathNode[]> {
    const progress = await this.prisma.userProgress.findMany({
      where: { userId },
      include: { lesson: true },
    })

    const completedLessons = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId))
    const inProgressLessons = progress.filter((p) => !p.completed && p.playCount > 0)

    const availableLessons = await this.prisma.lesson.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { order: 'asc' },
    })

    const nodes: LearningPathNode[] = []
    const seen = new Set<string>()

    for (const lesson of availableLessons) {
      if (seen.has(lesson.id)) continue
      if (completedLessons.has(lesson.id)) continue

      const isInProgress = inProgressLessons.find((p) => p.lessonId === lesson.id)
      const score = isInProgress
        ? 100 + ((isInProgress as any).score ?? 0)
        : 50 - nodes.length

      const prevLesson = await this.prisma.lesson.findFirst({
        where: { order: lesson.order - 1, mode: lesson.mode, language: lesson.language },
      })

      nodes.push({
        lessonId: lesson.id,
        priority: score,
        reason: isInProgress ? 'in_progress' : 'next_in_sequence',
        prerequisiteIds: prevLesson
          ? availableLessons.filter((l) => l.order < lesson.order && l.mode === lesson.mode).map((l) => l.id)
          : [],
      })

      seen.add(lesson.id)
    }

    nodes.sort((a, b) => b.priority - a.priority)
    return nodes.slice(0, limit)
  }

  async getRecommendations(userId: string): Promise<AIRecommendation[]> {
    const recs: AIRecommendation[] = []
    const metric = await this.prisma.studentMetric.findUnique({ where: { userId } })

    if (metric) {
      if (metric.currentStreak > 0 && metric.currentStreak < 3) {
        recs.push({
          type: 'streak_warning',
          message: `¡Ya llevas ${metric.currentStreak} día${metric.currentStreak > 1 ? 's' : ''} seguido! Sigue practicando para mantener tu racha.`,
          priority: 60,
        })
      }

      if (metric.accuracy < 0.5) {
        recs.push({
          type: 'practice',
          message: 'Intenta bajar la velocidad y enfocarte en la precisión.',
          priority: 90,
        })
      }

      if (metric.accuracy >= 0.85) {
        recs.push({
          type: 'advance',
          message: '¡Excelente precisión! Prueba con niveles más difíciles.',
          priority: 80,
          action: { increaseDifficulty: true },
        })
      }
    }

    const weakLetters = await this.prisma.letterDifficulty.findMany({
      where: { userId, attempts: { gte: 3 }, accuracy: { lt: 0.5 } },
      orderBy: { accuracy: 'asc' },
      take: 3,
    })

    if (weakLetters.length > 0) {
      recs.push({
        type: 'practice',
        message: `Practica las letras: ${weakLetters.map((l) => l.letter).join(', ')}`,
        priority: 100,
        action: { focusLetters: weakLetters.map((l) => l.letter) },
      })
    }

    const dueItems = await this.prisma.spacedRepetitionItem.count({
      where: { userId, nextReviewAt: { lte: new Date() } },
    })

    if (dueItems > 0) {
      recs.push({
        type: 'review',
        message: `Tienes ${dueItems} ítem${dueItems > 1 ? 's' : ''} para repasar.`,
        priority: 70,
        action: { reviewCount: dueItems },
      })
    }

    recs.sort((a, b) => b.priority - a.priority)
    return recs.slice(0, 5)
  }
}
