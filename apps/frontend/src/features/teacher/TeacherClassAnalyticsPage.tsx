import { useParams, Link } from 'react-router-dom'
import { useClassAnalytics } from './hooks/use-teacher'

export function TeacherClassAnalyticsPage() {
  const { classId } = useParams<{ classId: string }>()
  const { data: analytics, isLoading } = useClassAnalytics(classId ?? '')

  if (isLoading) return <div className="flex items-center justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-300 border-t-transparent" /></div>
  if (!analytics) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">No se pudieron cargar las analíticas</div>

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/teacher/dashboard" className="text-sky-600 hover:underline">Panel</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">Analíticas</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-800">Analíticas de la Clase</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <MetricBox label="Estudiantes" value={analytics.totalStudents} />
        <MetricBox label="Precisión Promedio" value={`${Math.round(analytics.avgAccuracy * 100)}%`} color={analytics.avgAccuracy >= 0.7 ? 'text-green-600' : 'text-orange-600'} />
        <MetricBox label="Total Partidas" value={analytics.totalGames} />
      </div>

      <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Estudiantes</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase text-gray-500">
                <th className="pb-2 pr-4">Nombre</th>
                <th className="pb-2 pr-4">XP</th>
                <th className="pb-2 pr-4">Monedas</th>
                <th className="pb-2">Precisión</th>
              </tr>
            </thead>
            <tbody>
              {analytics.students.map((s) => (
                <tr key={s.id} className="border-b border-gray-100">
                  <td className="py-2 pr-4 font-medium text-gray-800">{s.displayName}</td>
                  <td className="py-2 pr-4 text-gray-600">{s.xp}</td>
                  <td className="py-2 pr-4 text-gray-600">{s.coins}</td>
                  <td className="py-2">
                    <span className={s.accuracy >= 0.7 ? 'text-green-600' : 'text-orange-600'}>
                      {Math.round(s.accuracy * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MetricBox({ label, value, color = 'text-gray-800' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
