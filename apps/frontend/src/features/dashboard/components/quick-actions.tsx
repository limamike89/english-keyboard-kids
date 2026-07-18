import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/utils/constants'

export function QuickActions() {
  const navigate = useNavigate()

  const actions = [
    {
      icon: '🎮',
      label: 'Play',
      description: 'Start a game',
      onClick: () => navigate(ROUTES.HOME),
      color: 'bg-sky-500 hover:bg-sky-600',
    },
    {
      icon: '📊',
      label: 'Profile',
      description: 'Your stats',
      onClick: () => navigate(ROUTES.PROFILE),
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ]

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-gray-800">Quick Access</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={a.onClick}
            className={`flex items-center gap-4 rounded-xl p-5 text-left text-white shadow transition active:scale-95 ${a.color}`}
          >
            <span className="text-4xl">{a.icon}</span>
            <div>
              <p className="text-lg font-bold">{a.label}</p>
              <p className="text-sm opacity-80">{a.description}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
