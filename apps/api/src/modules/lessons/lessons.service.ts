import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LessonListItem, LessonDetail, QuestionItem } from './interfaces/lesson.interface';
import { GameMode } from '@prisma/client';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    options: { mode?: string; language?: string } = {},
    userId?: string,
  ): Promise<LessonListItem[]> {
    const where: Record<string, unknown> = { isActive: true, deletedAt: null };

    if (options.mode) {
      where.mode = options.mode as GameMode;
    }
    if (options.language) {
      where.language = options.language;
    }

    const lessons = await this.prisma.lesson.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    const items: LessonListItem[] = [];

    for (const lesson of lessons) {
      let userProgress: LessonListItem['userProgress'] = null;

      if (userId) {
        const progress = await this.prisma.userProgress.findUnique({
          where: { userId_lessonId: { userId, lessonId: lesson.id } },
        });

        if (progress) {
          userProgress = {
            score: progress.score,
            stars: progress.stars,
            completed: progress.completed,
            bestStreak: progress.bestStreak,
          };
        }
      }

      items.push({
        id: lesson.id,
        mode: lesson.mode,
        language: lesson.language,
        title: lesson.title,
        description: lesson.description,
        level: lesson.level,
        order: lesson.order,
        questionCount: lesson.questionCount,
        userProgress,
      });
    }

    return items;
  }

  async findById(id: string): Promise<LessonDetail> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson || lesson.deletedAt) {
      throw new NotFoundException('Lesson', id);
    }

    return {
      id: lesson.id,
      mode: lesson.mode,
      language: lesson.language,
      title: lesson.title,
      description: lesson.description,
      level: lesson.level,
      order: lesson.order,
      questionCount: lesson.questionCount,
      isActive: lesson.isActive,
      createdAt: lesson.createdAt.toISOString(),
    };
  }

  async findQuestions(
    lessonId: string,
    _options: { difficulty?: string } = {},
  ): Promise<QuestionItem[]> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson || lesson.deletedAt) {
      throw new NotFoundException('Lesson', lessonId);
    }

    const where: Record<string, unknown> = {
      lessonId,
      isActive: true,
      deletedAt: null,
    };

    if (_options.difficulty) {
      where.difficulty = _options.difficulty;
    }

    const questions = await this.prisma.question.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return questions.map((q) => ({
      id: q.id,
      lessonId: q.lessonId,
      type: q.type as 'LETTER' | 'NUMBER',
      audioKey: q.audioKey,
      correctAnswer: q.correctAnswer,
      displayText: q.displayText,
      hint: q.hint,
      order: q.order,
      difficulty: q.difficulty,
    }));
  }
}
