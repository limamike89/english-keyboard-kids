import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GlobalStats, ModeStats, HistoryEntry } from './interfaces/stats.interface';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobal(userId: string): Promise<GlobalStats> {
    const [user, stats] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.userStats.findMany({ where: { userId } }),
    ]);

    const totalCorrect = stats.reduce((s, r) => s + r.totalCorrect, 0);
    const totalIncorrect = stats.reduce((s, r) => s + r.totalIncorrect, 0);
    const totalQuestions = totalCorrect + totalIncorrect;

    return {
      totalGames: stats.reduce((s, r) => s + r.gamesPlayed, 0),
      totalScore: Number(stats.reduce((s, r) => s + Number(r.totalScore), 0)),
      totalCorrect,
      totalIncorrect,
      totalQuestions,
      overallAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) / 100 : 0,
      bestStreak: Math.max(...stats.map((s) => s.bestStreak), 0),
      xp: user?.xp ?? 0,
      coins: user?.coins ?? 0,
    };
  }

  async getModes(userId: string): Promise<ModeStats[]> {
    const stats = await this.prisma.userStats.findMany({
      where: { userId },
    });

    return stats.map((s) => ({
      mode: s.mode,
      gamesPlayed: s.gamesPlayed,
      totalScore: Number(s.totalScore),
      totalCorrect: s.totalCorrect,
      totalIncorrect: s.totalIncorrect,
      totalQuestions: s.totalQuestions,
      accuracy: s.totalQuestions > 0
        ? Math.round((s.totalCorrect / s.totalQuestions) * 100) / 100
        : 0,
      bestStreak: s.bestStreak,
      currentStreak: s.currentStreak,
      avgResponseTime: s.avgResponseTime,
      lastPlayedAt: s.lastPlayedAt?.toISOString() ?? null,
    }));
  }

  async getHistory(userId: string, limit = 20): Promise<HistoryEntry[]> {
    const answers = await this.prisma.userAnswer.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        question: {
          select: {
            audioKey: true,
            correctAnswer: true,
            displayText: true,
          },
        },
      },
    });

    return answers.map((a) => ({
      id: a.id,
      lessonId: a.lessonId,
      questionId: a.questionId,
      answer: a.answer,
      isCorrect: a.isCorrect,
      attemptNumber: a.attemptNumber,
      createdAt: a.createdAt.toISOString(),
      question: a.question
        ? {
            audioKey: a.question.audioKey,
            correctAnswer: a.question.correctAnswer,
            displayText: a.question.displayText,
          }
        : undefined,
    }));
  }
}
