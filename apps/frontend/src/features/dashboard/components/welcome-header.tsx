import type { GlobalStats } from '@/features/stats/types/stats.types'

interface WelcomeHeaderProps {
  displayName: string
  stats: GlobalStats
}

export function WelcomeHeader({ displayName, stats }: WelcomeHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <span className="text-5xl">🏆</span>
      <h1 className="text-3xl font-bold text-gray-900">
        Welcome, {displayName}!
      </h1>
      <p className="text-gray-500">
        You've played <strong className="text-sky-600">{stats.totalGames}</strong> games
        and earned <strong className="text-sky-600">{stats.xp}</strong> XP.
      </p>
    </div>
  )
}
