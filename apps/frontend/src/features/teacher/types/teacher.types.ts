export interface TeacherClass {
  id: string
  name: string
  description: string | null
  code: string
  isActive: boolean
  createdAt: string
  _count: { students: number; assignments: number }
}

export interface TeacherClassDetail {
  id: string
  name: string
  description: string | null
  code: string
  students: Array<{
    student: { id: string; displayName: string; username: string; xp: number; coins: number }
    joinedAt: string
  }>
  assignments: Array<{
    id: string
    title: string
    dueDate: string | null
    lesson: { title: string; mode: string }
  }>
  _count: { students: number }
}

export interface TeacherStudentProgress {
  studentId: string
  stats: { totalGames: number; totalCorrect: number; totalIncorrect: number; totalQuestions: number; accuracy: number }
  metric: { totalXp: number; totalCoins: number; bestStreak: number } | null
  progress: Array<{
    lesson: { title: string; mode: string }
    score: number
    stars: number
    completed: boolean
    lastPlayedAt: string
  }>
}

export interface ClassAnalytics {
  totalStudents: number
  avgAccuracy: number
  totalGames: number
  students: Array<{ id: string; displayName: string; xp: number; coins: number; accuracy: number }>
}

export interface TeacherAssignment {
  id: string
  title: string
  dueDate: string | null
  lesson: { title: string; mode: string }
  class: { name: string } | null
  createdAt: string
}
