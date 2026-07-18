import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useChildProgress } from './hooks/use-parent'

export function ChildProgressPage() {
  const { childId } = useParams<{ childId: string }>()
  const { data: progress, isLoading, error } = useChildProgress(childId ?? '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-300 border-t-transparent" />
      </div>
    )
  }

  if (error || !progress) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        No se pudo cargar el progreso del hijo.
      </div>
    )
  }

  const { stats, metric, achievements, dailyStreak, currentStreak } = progress

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-2">
        <Link to="/parent/dashboard" className="text-sm text-sky-600 hover:underline">Dashboard</Link>
        <span className="text-gray-400">/</span>
        <span className="text-sm text-gray-600">Progress</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricBox label="Accuracy" value={`${Math.round((stats.accuracy ?? 0) * 100)}%`} color={stats.accuracy >= 0.7 ? 'text-green-600' : 'text-orange-600'} />
        <MetricBox label="Partidas" value={stats.totalGames} />
        <MetricBox label="Streak" value={`${currentStreak} días`} />
        <MetricBox label="Correctas" value={stats.totalCorrect} color="text-green-600" />
        <MetricBox label="Incorrectas" value={stats.totalIncorrect} color="text-red-600" />
        <MetricBox label="XP Total" value={metric?.totalXp ?? 0} />
        <MetricBox label="Monedas" value={metric?.totalCoins ?? 0} />
        <MetricBox label="Preguntas" value={stats.totalQuestions} />
      </div>

      {achievements.length > 0 && (
        <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {achievements.map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                <span>{a.achievement.icon}</span> {a.achievement.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {progress.progress.length > 0 && (
        <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Lessons</h3>
          <div className="space-y-2">
            {progress.progress.map((p) => (
              <div key={p.lessonId} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                <div>
                  <span className="text-sm font-medium text-gray-800">{p.lessonTitle}</span>
                  <span className="ml-2 text-xs text-gray-400">{p.lessonMode}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{'★'.repeat(p.stars)}{'☆'.repeat(3 - p.stars)}</span>
                  <span>{p.score} pts</span>
                  <span className={p.completed ? 'text-green-600' : 'text-orange-600'}>{p.completed ? 'Completed' : 'In progress'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Streaks (últimos 30 days)</h3>
        <div className="flex flex-wrap gap-1">
          {dailyStreak.map((day) => (
            <span
              key={day.date}
              className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${
                day.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}
              title={day.date}
            >
              {new Date(day.date).getDate()}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function MetricBox({ label, value, color = 'text-gray-800' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
