import { useAnalyticsDashboard } from './hooks/use-analytics'
import { MetricCard } from './components/MetricCard'
import { DifficultyList } from './components/DifficultyList'
import { ActivityChart } from './components/ActivityChart'
import { Link } from 'react-router-dom'

export function AnalyticsPage() {
  const { dashboard, isLoading, error } = useAnalyticsDashboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-300 border-t-transparent" />
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        Could not load analytics panel.
      </div>
    )
  }

  const { profile } = dashboard
  const m = profile.metrics

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <Link
          to="/dashboard"
          className="rounded-lg border border-sky-300 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
        >
          Dashboard
        </Link>
      </div>

      {profile.recommendations.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-emerald-700">Recomendaciones</h2>
          <ul className="space-y-1">
            {profile.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-emerald-800">
                <span className="mt-0.5 text-emerald-500">-</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Accuracy" value={`${Math.round(m.accuracy * 100)}%`} icon="-" color={m.accuracy >= 0.7 ? 'text-green-600' : 'text-orange-600'} />
        <MetricCard label="Partidas" value={m.totalGames} icon="-" />
        <MetricCard label="Racha Actual" value={m.currentStreak} icon="-" />
        <MetricCard label="XP Total" value={m.totalXp} icon="-" />
        <MetricCard label="Correctas" value={m.totalCorrect} icon="-" color="text-green-600" />
        <MetricCard label="Incorrectas" value={m.totalIncorrect} icon="-" color="text-red-600" />
        <MetricCard label="Mejor Racha" value={m.bestStreak} icon="-" />
        <MetricCard label="Monedas" value={m.totalCoins} icon="-" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DifficultyList title="Weakest Letters" items={profile.weakestLetters} type="weak" />
        <DifficultyList title="Weakest Numbers" items={profile.weakestNumbers} type="weak" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DifficultyList title="Strongest Letters" items={profile.strongestLetters} type="strong" />
        <DifficultyList title="Strongest Numbers" items={profile.strongestNumbers} type="strong" />
      </div>

      <ActivityChart activity={profile.recentActivity} />
    </div>
  )
}
