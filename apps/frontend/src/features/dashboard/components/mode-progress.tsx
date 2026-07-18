import type { ProgressItem } from '@/features/progress/types/progress.types'

interface ModeProgressProps {
  progress: ProgressItem[]
}

const MODES = ['LETTERS', 'NUMBERS', 'MIXED'] as const
const MODE_LABEL: Record<string, string> = {
  LETTERS: '🔤 Letras',
  NUMBERS: '🔢 Numbers',
  MIXED: '🎯 Mixto',
}

export function ModeProgress({ progress }: ModeProgressProps) {
  const byMode = MODES.map((mode) => {
    const items = progress.filter((p) => p.lessonMode === mode)
    const completed = items.filter((p) => p.completed).length
    const stars = items.reduce((s, p) => s + p.stars, 0)
    const total = items.length
    return { mode, label: MODE_LABEL[mode], completed, total, stars }
  })

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-gray-800">Progreso por modo</h2>
      <div className="space-y-4">
        {byMode.map((m) => (
          <div key={m.mode} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-gray-900">{m.label}</span>
              <span className="text-sm text-gray-400">
                {m.completed}/{m.total} · ⭐ {m.stars}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-sky-500 transition-all"
                style={{ width: `${m.total > 0 ? (m.completed / m.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
