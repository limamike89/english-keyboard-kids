import api from '@/shared/services/api'
import type { LessonListItem } from '../types/lesson.types'

interface LessonApiItem {
  id: string
  title: string
  mode: 'LETTERS' | 'NUMBERS' | 'MIXED'
  language: string
  description: string | null
  questionCount: number
  userProgress: { completed: boolean; stars: number } | null
}

export async function fetchLessons(): Promise<LessonListItem[]> {
  const { data } = await api.get('/lessons')
  return (data.data as LessonApiItem[]).map((item) => ({
    lessonId: item.id,
    lessonTitle: item.title,
    lessonMode: item.mode,
    language: item.language,
    description: item.description,
    questionCount: item.questionCount,
    completed: item.userProgress?.completed ?? false,
    stars: item.userProgress?.stars ?? 0,
  }))
}
