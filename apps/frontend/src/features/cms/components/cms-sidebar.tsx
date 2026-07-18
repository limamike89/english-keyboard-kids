import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/cms', icon: '📊' },
  { label: 'Letras', path: '/cms/letters', icon: '🔤' },
  { label: 'Números', path: '/cms/numbers', icon: '🔢' },
  { label: 'Palabras', path: '/cms/words', icon: '📝' },
  { label: 'Categorías', path: '/cms/categories', icon: '📂' },
  { label: 'Idiomas', path: '/cms/languages', icon: '🌐' },
  { label: 'Niveles', path: '/cms/levels', icon: '📈' },
  { label: 'Logros', path: '/cms/achievements', icon: '🏆' },
  { label: 'Media', path: '/cms/media', icon: '🖼️' },
  { label: 'Configuración', path: '/cms/config', icon: '⚙️' },
  { label: 'Import/Export', path: '/cms/import-export', icon: '📦' },
  { label: 'Auditoría', path: '/cms/audit', icon: '📋' },
]

export function CmsSidebar() {
  const location = useLocation()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-4">
        <span className="text-xl">⚙️</span>
        <span className="font-bold text-gray-800">CMS Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sky-50 text-sky-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-200 px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Volver al inicio
        </Link>
      </div>
    </aside>
  )
}
