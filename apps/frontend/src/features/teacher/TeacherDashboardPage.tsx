import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTeacherClasses } from './hooks/use-teacher'
import { createClass } from './services/teacher.service'
import { useParentAuthStore } from '@/features/auth/store/parent-auth.store'

export function TeacherDashboardPage() {
  const { data: classes, isLoading, refetch } = useTeacherClasses()
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const user = useParentAuthStore((s) => s.user)
  const logout = useParentAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleCreate = async () => {
    await createClass(name, desc || undefined)
    setName('')
    setDesc('')
    setShowCreate(false)
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-300 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel del Docente</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <button onClick={() => { logout(); navigate('/parent/login') }} className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50">
          Cerrar Sesión
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-700">Mis Clases</h2>
        <button onClick={() => setShowCreate(true)} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700">
          + Nueva Clase
        </button>
      </div>

      {showCreate && (
        <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la clase" className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" />
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descripción (opcional)" className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">Crear</button>
            <button onClick={() => setShowCreate(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          </div>
        </div>
      )}

      {classes && classes.length === 0 && (
        <div className="rounded-xl border border-sky-200 bg-white p-8 text-center text-gray-500 shadow-sm">
          No tienes clases todavía. Crea una para empezar.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {classes?.map((cls) => (
          <div key={cls.id} className="rounded-xl border border-sky-200 bg-white p-5 shadow-sm transition hover:border-sky-400">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{cls.name}</h3>
                {cls.description && <p className="mt-1 text-sm text-gray-500">{cls.description}</p>}
              </div>
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-mono text-sky-700">{cls.code}</span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              <span>{cls._count.students} estudiantes</span>
              <span>{cls._count.assignments} tareas</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => navigate(`/teacher/classes/${cls.id}`)} className="rounded-lg border border-sky-300 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50">
                Ver clase
              </button>
              <button onClick={() => navigate(`/teacher/classes/${cls.id}/analytics`)} className="rounded-lg border border-sky-300 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50">
                Analíticas
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
