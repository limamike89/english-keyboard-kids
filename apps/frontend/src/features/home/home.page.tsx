import { Hero } from './components/hero'
import { ModeSelector } from './components/mode-selector'
import { useHome } from './hooks/use-home'

export function HomePage() {
  const { displayName, lessons, isLoading, error, handleSelect } = useHome()

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
        Could not connect to the server. Please try again later.
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <Hero displayName={displayName} />
      <ModeSelector lessons={lessons} onSelect={handleSelect} />
    </div>
  )
}
