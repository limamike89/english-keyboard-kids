import { useParams, Link } from 'react-router-dom'
import { useStudentProgress } from './hooks/use-teacher'

export function TeacherStudentProgressPage() {
  const { classId, studentId } = useParams<{ classId: string; studentId: string }>()
  const { data: progress, isLoading } = useStudentProgress(classId ?? '', studentId ?? '')

  if (isLoading) return <div className="flex items-center justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-300 border-t-transparent" /></div>
  if (!progress) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">No se pudo cargar el progreso</div>

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/teacher/dashboard" className="text-sky-600 hover:underline">Panel</Link>
        <span className="text-gray-400">/</span>
        <span className="text-sky-600 hover:underline">
          <Link to={`/teacher/classes/${classId}`}>Clase</Link>
        </span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">Progreso</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-800">Progreso del Estudiante</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricBox label="Precisión" value={`${Math.round(progress.stats.accuracy * 100)}%`} />
        <MetricBox label="Partidas" value={progress.stats.totalGames} />
        <MetricBox label="Correctas" value={progress.stats.totalCorrect} color="text-green-600" />
        <MetricBox label="Incorrectas" value={progress.stats.totalIncorrect} color="text-red-600" />
      </div>

      {progress.progress.length > 0 && (
        <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Lecciones</h3>
          <div className="space-y-2">
            {progress.progress.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                <span className="font-medium text-gray-800">{p.lesson.title}</span>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{p.lesson.mode}</span>
                  <span>{'★'.repeat(p.stars)}{'☆'.repeat(3 - p.stars)}</span>
                  <span>{p.score} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
