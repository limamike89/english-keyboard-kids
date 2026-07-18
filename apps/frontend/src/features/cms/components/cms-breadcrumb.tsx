import { Link, useLocation } from 'react-router-dom'

const labelMap: Record<string, string> = {
  '': 'Dashboard',
  letters: 'Letras',
  numbers: 'Números',
  words: 'Palabras',
  categories: 'Categorías',
  languages: 'Idiomas',
  levels: 'Niveles',
  achievements: 'Logros',
  media: 'Media',
  config: 'Configuración',
  'import-export': 'Import/Export',
  audit: 'Auditoría',
}

export function CmsBreadcrumb() {
  const location = useLocation()
  const parts = location.pathname.replace('/cms', '').split('/').filter(Boolean)

  return (
    <nav className="mb-4 text-sm text-gray-500">
      <Link to="/cms" className="hover:text-sky-600">CMS</Link>
      {parts.map((part, i) => {
        const path = '/cms/' + parts.slice(0, i + 1).join('/')
        const label = labelMap[part] || part
        const isLast = i === parts.length - 1
        return (
          <span key={part}>
            <span className="mx-2">/</span>
            {isLast ? (
              <span className="font-medium text-gray-800">{label}</span>
            ) : (
              <Link to={path} className="hover:text-sky-600">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
