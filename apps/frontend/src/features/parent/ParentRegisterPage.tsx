import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerParent } from './services/parent.service'
import { useParentAuthStore } from '@/features/auth/store/parent-auth.store'

export function ParentRegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setParentSession = useParentAuthStore((s) => s.setParentSession)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await registerParent(email, password, displayName)
      setParentSession(res.token, res.user)
      navigate('/parent/dashboard')
    } catch {
      setError('Registration failed. Email may be in use.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">Parent Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-sky-200 bg-white p-6 shadow-sm">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">Name</label>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none" />
        </div>
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-sky-600 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50">
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p className="text-center text-xs text-gray-500">
          Already have an account?{' '}
          <a href="/parent/login" className="text-sky-600 hover:underline">Sign In</a>
        </p>
      </form>
    </div>
  )
}
