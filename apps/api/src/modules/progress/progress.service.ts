import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProgressSummary, ProgressItem, StreakInfo } from './interfaces/progress.interface';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<ProgressSummary> {
    const [lessons, progressRecords] = await Promise.all([
      this.prisma.lesson.findMany({
        where: { isActive: true, deletedAt: null },
        orderBy: { order: 'asc' },
      }),
      this.prisma.userProgress.findMany({
        where: { userId },
      }),
    ]);

    const progressMap = new Map(progressRecords.map((p) => [p.lessonId, p]));

    const progress: ProgressItem[] = lessons.map((lesson) => {
      const record = progressMap.get(lesson.id);
      return {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonMode: lesson.mode,
        language: lesson.language,
        score: record?.score ?? 0,
        totalQuestions: lesson.questionCount,
        correctFirstTry: record?.correctFirstTry ?? 0,
        stars: record?.stars ?? 0,
        bestStreak: record?.bestStreak ?? 0,
        completed: record?.completed ?? false,
        completedAt: record?.completedAt?.toISOString() ?? null,
        playCount: record?.playCount ?? 0,
        lastPlayedAt: (record?.lastPlayedAt ?? lesson.createdAt).toISOString(),
      };
    });

    const completed = progress.filter((p) => p.completed);
    const accuracy =
      progress.reduce((sum, p) => sum + p.correctFirstTry, 0) /
      Math.max(progress.reduce((sum, p) => sum + p.totalQuestions, 0), 1);

    return {
      totalLessons: lessons.length,
      completedLessons: completed.length,
      totalScore: progress.reduce((sum, p) => sum + p.score, 0),
      totalStars: progress.reduce((sum, p) => sum + p.stars, 0),
      averageAccuracy: Math.round(accuracy * 100) / 100,
      progress,
    };
  }

  async findByLesson(userId: string, lessonId: string): Promise<ProgressItem> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson || lesson.deletedAt) {
      throw new NotFoundException('Lesson', lessonId);
    }

    const record = await this.prisma.userProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });

    return {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonMode: lesson.mode,
      language: lesson.language,
      score: record?.score ?? 0,
      totalQuestions: lesson.questionCount,
      correctFirstTry: record?.correctFirstTry ?? 0,
      stars: record?.stars ?? 0,
      bestStreak: record?.bestStreak ?? 0,
      completed: record?.completed ?? false,
      completedAt: record?.completedAt?.toISOString() ?? null,
      playCount: record?.playCount ?? 0,
      lastPlayedAt: (record?.lastPlayedAt ?? lesson.createdAt).toISOString(),
    };
  }

  async findStreak(userId: string, lessonId: string): Promise<StreakInfo> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson || lesson.deletedAt) {
      throw new NotFoundException('Lesson', lessonId);
    }

    const [progress, stats, dailyStreaks] = await Promise.all([
      this.prisma.userProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId } },
      }),
      this.prisma.userStats.findUnique({
        where: { userId_mode: { userId, mode: lesson.mode } },
      }),
      this.prisma.dailyStreak.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 30,
      }),
    ]);

    return {
      lessonId,
      lessonMode: lesson.mode,
      bestStreak: progress?.bestStreak ?? stats?.bestStreak ?? 0,
      currentStreakInGames: stats?.currentStreak ?? 0,
      dailyStreaks: dailyStreaks.map((ds) => ({
        date: ds.date.toISOString().split('T')[0],
        completed: ds.completed,
        xpEarned: ds.xpEarned,
      })),
    };
  }
}
