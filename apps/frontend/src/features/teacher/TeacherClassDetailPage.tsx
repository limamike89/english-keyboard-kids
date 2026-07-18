import { useParams, Link, useNavigate } from 'react-router-dom'
import { useClassDetail } from './hooks/use-teacher'
import { useState } from 'react'
import { createAssignment } from './services/teacher.service'

export function TeacherClassDetailPage() {
  const { classId } = useParams<{ classId: string }>()
  const { data: cls, isLoading, refetch } = useClassDetail(classId ?? '')
  const [showAssign, setShowAssign] = useState(false)
  const [title, setTitle] = useState('')
  const [lessonId, setLessonId] = useState('')
  const navigate = useNavigate()

  const handleAssign = async () => {
    if (!title || !lessonId) return
    await createAssignment({ classId, lessonId, title })
    setTitle('')
    setLessonId('')
    setShowAssign(false)
    refetch()
  }

  if (isLoading) return <div className="flex items-center justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-300 border-t-transparent" /></div>
  if (!cls) return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">Clase no encontrada</div>

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/teacher/dashboard" className="text-sky-600 hover:underline">Panel</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-600">{cls.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{cls.name}</h1>
          <p className="text-sm text-gray-500">Código: <span className="font-mono font-bold text-sky-700">{cls.code}</span></p>
        </div>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700">{cls._count.students} estudiantes</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Estudiantes</h3>
          {cls.students.length === 0 ? (
            <p className="text-sm text-gray-400">Sin estudiantes</p>
          ) : (
            <ul className="space-y-2">
              {cls.students.map((s) => (
                <li key={s.student.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-sm font-medium text-gray-800">{s.student.displayName}</span>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{s.student.xp} XP</span>
                    <button onClick={() => navigate(`/teacher/classes/${classId}/students/${s.student.id}`)} className="text-sky-600 hover:underline">
                      Ver
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">Tareas</h3>
            <button onClick={() => setShowAssign(true)} className="text-xs font-medium text-sky-600 hover:underline">+ Nueva</button>
          </div>

          {showAssign && (
            <div className="mb-3 space-y-2 rounded-lg bg-gray-50 p-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título de la tarea" className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none" />
              <input value={lessonId} onChange={(e) => setLessonId(e.target.value)} placeholder="ID de la lección" className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none" />
              <div className="flex gap-2">
                <button onClick={handleAssign} className="rounded bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700">Crear</button>
                <button onClick={() => setShowAssign(false)} className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100">Cancelar</button>
              </div>
            </div>
          )}

          {cls.assignments.length === 0 ? (
            <p className="text-sm text-gray-400">Sin tareas asignadas</p>
          ) : (
            <ul className="space-y-2">
              {cls.assignments.map((a) => (
                <li key={a.id} className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <span className="font-medium text-gray-800">{a.title}</span>
                  <span className="ml-2 text-xs text-gray-400">{a.lesson.title} ({a.lesson.mode})</span>
                  {a.dueDate && <span className="ml-2 text-xs text-orange-500">Vence: {new Date(a.dueDate).toLocaleDateString()}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
