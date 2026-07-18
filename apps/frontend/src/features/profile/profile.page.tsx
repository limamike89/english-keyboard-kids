import { useNavigate } from 'react-router-dom'
import { useProfile } from './hooks/use-profile'
import { StatsOverview } from './components/stats-overview'
import { LessonProgressList } from './components/lesson-progress-list'
import { ROUTES } from '@/shared/utils/constants'

export function ProfilePage() {
  const navigate = useNavigate()
  const { displayName, stats, progress, isLoading, error } = useProfile()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-300 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        Could not load profile data.
      </div>
    )
  }

  return (
    <div className="space-y-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500">{displayName}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.HOME)}
          className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          Back
        </button>
      </div>

      {stats && <StatsOverview stats={stats} />}
      <LessonProgressList items={progress} />
    </div>
  )
}
