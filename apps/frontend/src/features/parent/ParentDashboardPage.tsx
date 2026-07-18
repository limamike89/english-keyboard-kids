import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useParentChildren } from './hooks/use-parent'
import { useParentAuthStore } from '@/features/auth/store/parent-auth.store'
import { generateLinkCode, linkChild } from './services/parent.service'

export function ParentDashboardPage() {
  const { data: children, isLoading, error } = useParentChildren()
  const user = useParentAuthStore((s) => s.user)
  const logout = useParentAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [username, setUsername] = useState('')
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState('')
  const [linkSuccess, setLinkSuccess] = useState('')

  const [generatedCode, setGeneratedCode] = useState('')
  const [generating, setGenerating] = useState(false)
  const [codeError, setCodeError] = useState('')

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    setLinking(true)
    setLinkError('')
    setLinkSuccess('')
    try {
      const res = await linkChild(username.trim())
      setLinkSuccess(`${res.childName} vinculado correctamente!`)
      setUsername('')
      queryClient.invalidateQueries({ queryKey: ['parent', 'children'] })
    } catch {
      setLinkError('No child found with that username.')
    } finally {
      setLinking(false)
    }
  }

  const handleGenerateCode = async () => {
    setGenerating(true)
    setCodeError('')
    setGeneratedCode('')
    try {
      const res = await generateLinkCode()
      setGeneratedCode(res.code)
    } catch {
      setCodeError('Error generating code.')
    } finally {
      setGenerating(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-800">Parent Dashboard</h1>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/parent/settings" className="rounded-lg border border-sky-300 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 transition hover:bg-sky-50">
            Settings
          </Link>
          <button onClick={() => { logout(); navigate('/parent/login') }} className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50">
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-700">
          No se pudieron cargar los hijos vinculados.
        </div>
      )}

      {/* Children list */}
      {children && children.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((child) => (
            <Link
              key={child.id}
              to={`/parent/children/${child.id}`}
              className="rounded-xl border border-sky-200 bg-white p-5 shadow-sm transition hover:border-sky-400 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">{child.displayName}</h3>
                <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                  {child.xp} XP
                </span>
              </div>
              <div className="mt-2 flex gap-4 text-sm text-gray-500">
                <span>Monedas: {child.coins}</span>
                <span>Usuario: {child.username}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Link section */}
      <div className="rounded-xl border border-sky-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-800">Link a child</h2>

        {linkSuccess && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{linkSuccess}</div>
        )}

        {!children || children.length === 0 ? (
          <p className="mb-4 text-sm text-gray-500">
            Ask your child for their username in the app to link them.
          </p>
        ) : null}

        <div className="space-y-4">
          {/* Link by username */}
          <form onSubmit={handleLink} className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Child's username"
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={linking || !username.trim()}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
            >
              {linking ? 'Linking...' : 'Link'}
            </button>
          </form>
          {linkError && <p className="text-sm text-red-600">{linkError}</p>}

          <div className="flex items-center gap-2">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">o</span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Generate link code */}
          <div>
            <button
              type="button"
              onClick={handleGenerateCode}
              disabled={generating}
              className="w-full rounded-lg border border-sky-300 bg-white px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate link code'}
            </button>
            {codeError && <p className="mt-1 text-sm text-red-600">{codeError}</p>}
            {generatedCode && (
              <div className="mt-3 rounded-lg bg-sky-50 p-4 text-center">
                <p className="mb-1 text-xs text-gray-500">Share this code with your child:</p>
                <p className="select-all text-2xl font-bold tracking-widest text-sky-700">{generatedCode}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


