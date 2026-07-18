import { GameMode, Difficulty } from '@prisma/client';

export interface LessonListItem {
  id: string;
  mode: GameMode;
  language: string;
  title: string;
  description: string | null;
  level: number;
  order: number;
  questionCount: number;
  userProgress: {
    score: number;
    stars: number;
    completed: boolean;
    bestStreak: number;
  } | null;
}

export interface LessonDetail {
  id: string;
  mode: GameMode;
  language: string;
  title: string;
  description: string | null;
  level: number;
  order: number;
  questionCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface QuestionItem {
  id: string;
  lessonId: string;
  type: 'LETTER' | 'NUMBER';
  audioKey: string;
  correctAnswer: string;
  displayText: string | null;
  hint: string | null;
  order: number;
  difficulty: Difficulty;
}
