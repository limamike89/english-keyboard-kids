import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginParent } from './services/parent.service'
import { useParentAuthStore } from '@/features/auth/store/parent-auth.store'

export function ParentLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setParentSession = useParentAuthStore((s) => s.setParentSession)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginParent(email, password)
      setParentSession(res.token, res.user)
      navigate('/parent/dashboard')
    } catch {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Parent Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-sky-200 bg-white p-6 shadow-sm">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-sky-600 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <a href="/parent/register" className="text-sky-600 hover:underline">Register</a>
        </p>
      </form>
    </div>
  )
}
