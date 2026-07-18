export interface LessonListItem {
  lessonId: string
  lessonTitle: string
  lessonMode: 'LETTERS' | 'NUMBERS' | 'MIXED'
  language: string
  description: string | null
  questionCount: number
  completed: boolean
  stars: number
}
