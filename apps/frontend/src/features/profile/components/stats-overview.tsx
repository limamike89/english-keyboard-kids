import type { GlobalStats } from '@/features/stats/types/stats.types'

interface StatsOverviewProps {
  stats: GlobalStats
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const cards = [
    { label: 'Points', value: stats.totalScore, color: 'bg-sky-50 text-sky-600' },
    { label: 'XP', value: `+${stats.xp}`, color: 'bg-purple-50 text-purple-600' },
    { label: 'Coins', value: stats.coins, color: 'bg-amber-50 text-amber-600' },
    { label: 'Games', value: stats.totalGames, color: 'bg-green-50 text-green-600' },
    { label: 'Accuracy', value: `${Math.round(stats.overallAccuracy * 100)}%`, color: 'bg-blue-50 text-blue-600' },
    { label: 'Best Streak', value: stats.bestStreak, color: 'bg-rose-50 text-rose-600' },
  ]

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-gray-800">Stats</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl p-4 text-center ${c.color}`}>
            <span className="block text-2xl font-bold">{c.value}</span>
            <span className="text-xs opacity-75">{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
