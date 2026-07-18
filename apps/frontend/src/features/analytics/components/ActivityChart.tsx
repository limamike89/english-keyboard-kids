import type { DailyActivity } from '../types/analytics.types'

interface ActivityChartProps {
  activity: DailyActivity[]
}

export function ActivityChart({ activity }: ActivityChartProps) {
  if (activity.length === 0) {
    return (
      <div className="rounded-xl border border-sky-200 bg-white p-4 text-center text-sm text-gray-400 shadow-sm">
        No hay actividad reciente
      </div>
    )
  }

  const maxQuestions = Math.max(...activity.map((d) => d.questionsAnswered), 1)

  return (
    <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Actividad Reciente</h3>
      <div className="flex items-end gap-1" style={{ height: '120px' }}>
        {activity.map((day) => {
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1" title={`${day.date}: ${day.correct} correctas, ${day.incorrect} incorrectas`}>
              <div className="flex w-full flex-col-reverse" style={{ height: '100px' }}>
                <div
                  className="w-full rounded-t bg-green-400 transition-all"
                  style={{ height: `${(day.correct / maxQuestions) * 100}%` }}
                />
                <div
                  className="w-full rounded-t bg-red-400 transition-all"
                  style={{ height: `${(day.incorrect / maxQuestions) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400">
                {new Date(day.date).toLocaleDateString('es', { weekday: 'short' })}
              </span>
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex justify-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-green-400" /> Correctas</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-red-400" /> Incorrectas</span>
      </div>
    </div>
  )
}
