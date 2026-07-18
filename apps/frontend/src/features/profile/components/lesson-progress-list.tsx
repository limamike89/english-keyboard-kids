import type { ProgressItem } from '@/features/progress/types/progress.types'

interface LessonProgressListProps {
  items: ProgressItem[]
}

const MODE_ICON: Record<string, string> = {
  LETTERS: '🔤',
  NUMBERS: '🔢',
  MIXED: '🎯',
}

export function LessonProgressList({ items }: LessonProgressListProps) {
  if (items.length === 0) {
    return (
      <p className="py-4 text-center text-gray-400">
        You haven't played any lessons yet.
      </p>
    )
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-gray-800">Lessons</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.lessonId}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm"
          >
            <span className="text-3xl">{MODE_ICON[item.lessonMode] ?? '📚'}</span>
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-gray-900">{item.lessonTitle}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{item.playCount} play{item.playCount !== 1 ? 's' : ''}</span>
                <span>{item.correctFirstTry}/{item.totalQuestions} correct</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} className={i < item.stars ? '' : 'opacity-20'}>
                  ⭐
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
