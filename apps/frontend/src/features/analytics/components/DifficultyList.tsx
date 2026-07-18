import type { ItemDifficulty } from '../types/analytics.types'

interface DifficultyListProps {
  title: string
  items: ItemDifficulty[]
  emptyMessage?: string
  type: 'weak' | 'strong'
}

function accuracyColor(accuracy: number, type: 'weak' | 'strong'): string {
  if (type === 'weak') {
    if (accuracy < 0.4) return 'bg-red-500'
    if (accuracy < 0.6) return 'bg-orange-500'
    return 'bg-yellow-500'
  }
  if (accuracy >= 0.9) return 'bg-green-500'
  if (accuracy >= 0.7) return 'bg-emerald-500'
  return 'bg-yellow-500'
}

export function DifficultyList({ title, items, emptyMessage = 'No hay datos suficientes', type }: DifficultyListProps) {
  return (
    <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">{title}</h3>
      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.item} className="flex items-center justify-between">
              <span className="font-mono text-lg font-bold text-gray-800">{item.item}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full transition-all ${accuracyColor(item.accuracy, type)}`}
                    style={{ width: `${item.accuracy * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-medium text-gray-500">
                  {Math.round(item.accuracy * 100)}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
