import { useEffect, useState } from 'react'
import { useCmsAuth } from './hooks/use-cms-auth'
import cmsApi from './services/cms-api'

interface DashboardStats {
  letters: number
  numbers: number
  words: number
  categories: number
  languages: number
  levels: number
  achievements: number
  media: number
  auditEntries: number
}

export function CmsDashboardPage() {
  const { user } = useCmsAuth()
  const [stats, setStats] = useState<DashboardStats>({
    letters: 0, numbers: 0, words: 0, categories: 0,
    languages: 0, levels: 0, achievements: 0, media: 0, auditEntries: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const results = await Promise.allSettled([
          cmsApi.get('/letters?limit=1'),
          cmsApi.get('/numbers?limit=1'),
          cmsApi.get('/words?limit=1'),
          cmsApi.get('/categories?limit=1'),
          cmsApi.get('/languages?limit=1'),
          cmsApi.get('/levels?limit=1'),
          cmsApi.get('/achievements?limit=1'),
          cmsApi.get('/media?limit=1'),
          cmsApi.get('/audit?limit=1'),
        ])
        const extractTotal = (r: PromiseSettledResult<unknown>) => {
          if (r.status === 'fulfilled') {
            const resp = r.value as { data?: { meta?: { total: number } } }
            return resp?.data?.meta?.total ?? 0
          }
          return 0
        }
        setStats({
          letters: extractTotal(results[0]),
          numbers: extractTotal(results[1]),
          words: extractTotal(results[2]),
          categories: extractTotal(results[3]),
          languages: extractTotal(results[4]),
          levels: extractTotal(results[5]),
          achievements: extractTotal(results[6]),
          media: extractTotal(results[7]),
          auditEntries: extractTotal(results[8]),
        })
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const cards = [
    { label: 'Letras', value: stats.letters, color: 'bg-blue-50 text-blue-700' },
    { label: 'Números', value: stats.numbers, color: 'bg-green-50 text-green-700' },
    { label: 'Palabras', value: stats.words, color: 'bg-purple-50 text-purple-700' },
    { label: 'Categorías', value: stats.categories, color: 'bg-orange-50 text-orange-700' },
    { label: 'Idiomas', value: stats.languages, color: 'bg-teal-50 text-teal-700' },
    { label: 'Niveles', value: stats.levels, color: 'bg-pink-50 text-pink-700' },
    { label: 'Logros', value: stats.achievements, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Media', value: stats.media, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Auditoría', value: stats.auditEntries, color: 'bg-gray-50 text-gray-700' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome, {user?.displayName} ({user?.roles?.join(', ')})
        </p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-300 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className={`rounded-xl p-5 ${card.color}`}>
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="mt-1 text-sm font-medium opacity-80">{card.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
