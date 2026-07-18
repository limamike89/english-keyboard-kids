import { useDashboard } from './hooks/use-dashboard'
import { WelcomeHeader } from './components/welcome-header'
import { ModeProgress } from './components/mode-progress'
import { QuickActions } from './components/quick-actions'

export function DashboardPage() {
  const { displayName, stats, progress, isLoading, error } = useDashboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-300 border-t-transparent" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        No se pudo cargar el dashboard.
      </div>
    )
  }

  return (
    <div className="space-y-8 py-4">
      <WelcomeHeader displayName={displayName} stats={stats} />
      <QuickActions />
      <ModeProgress progress={progress} />
    </div>
  )
}
