import type { LessonListItem } from '@/features/lessons/types/lesson.types'

interface ModeSelectorProps {
  lessons: LessonListItem[]
  onSelect: (lessonId: string) => void
}

const MODE_META = {
  LETTERS: { icon: '🔤', title: 'Letters', description: 'Learn the alphabet' },
  NUMBERS: { icon: '🔢', title: 'Numbers', description: 'Recognize numbers' },
  MIXED: { icon: '🎯', title: 'Mixed', description: 'Letters and numbers combined' },
} as const

export function ModeSelector({ lessons, onSelect }: ModeSelectorProps) {
  if (lessons.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">
        No lessons available yet.
      </p>
    )
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800">Pick a mode</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => {
          const meta = MODE_META[lesson.lessonMode]
          return (
            <button
              key={lesson.lessonId}
              onClick={() => onSelect(lesson.lessonId)}
              className="flex flex-col items-center gap-3 rounded-2xl border-2 border-sky-200 bg-white p-6 shadow-sm transition hover:border-sky-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <span className="text-5xl">{meta?.icon ?? '📚'}</span>
              <span className="text-xl font-bold text-gray-900">
                {meta?.title ?? lesson.lessonMode}
              </span>
              <span className="text-sm text-gray-500">
                {meta?.description ?? lesson.lessonMode}
              </span>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                  {lesson.questionCount} questions
                </span>
                {lesson.completed && (
                  <span className="text-lg" title="Completed">
                    ⭐
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
