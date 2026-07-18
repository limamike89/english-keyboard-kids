import { Outlet, Link } from 'react-router-dom'
import { ROUTES } from '@/shared/utils/constants'

export function RootLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white">
      <header className="border-b border-sky-200 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-4 py-3 sm:flex-row sm:justify-between">
          <Link to={ROUTES.HOME} className="text-lg font-bold text-sky-700">
            🔤 English Keyboard Kids
          </Link>
          <nav className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs font-medium text-gray-600 sm:text-sm">
            <Link to={ROUTES.HOME} className="whitespace-nowrap transition hover:text-sky-600">
              Home
            </Link>
            <Link to={ROUTES.DASHBOARD} className="whitespace-nowrap transition hover:text-sky-600">
              Dashboard
            </Link>
            <Link to={ROUTES.ANALYTICS} className="whitespace-nowrap transition hover:text-sky-600">
              Analytics
            </Link>
            <Link to={ROUTES.PROFILE} className="whitespace-nowrap transition hover:text-sky-600">
              Profile
            </Link>
            <Link to={ROUTES.PARENT_LOGIN} className="whitespace-nowrap transition hover:text-sky-600">
              Parents
            </Link>
            <Link to="/teacher/dashboard" className="whitespace-nowrap transition hover:text-sky-600">
              Teacher
            </Link>
            <Link to={ROUTES.SETTINGS} className="whitespace-nowrap transition hover:text-sky-600">
              Settings
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
