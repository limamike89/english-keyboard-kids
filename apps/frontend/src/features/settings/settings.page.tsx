import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SettingsSection } from './components/settings-section'
import { DisplayNameForm } from './components/display-name-form'
import { useSettings } from './hooks/use-settings'
import { redeemLinkCode } from '@/features/auth/services/auth.service'
import { ROUTES } from '@/shared/utils/constants'

export function SettingsPage() {
  const navigate = useNavigate()
  const { displayName, updateDisplayName, updateError } = useSettings()

  const [code, setCode] = useState('')
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState('')
  const [linkSuccess, setLinkSuccess] = useState('')

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setLinking(true)
    setLinkError('')
    setLinkSuccess('')
    try {
      const res = await redeemLinkCode(code.trim())
      setLinkSuccess(`Linked to ${res.parentName}!`)
      setCode('')
    } catch {
      setLinkError('Invalid or expired code.')
    } finally {
      setLinking(false)
    }
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <button
          type="button"
          onClick={() => navigate(ROUTES.HOME)}
          className="rounded-xl bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          Back
        </button>
      </div>

      <SettingsSection title="Name" description="How you appear in the game">
        <DisplayNameForm currentName={displayName} onSubmit={updateDisplayName} />
        {updateError && (
          <p className="mt-2 text-sm text-red-600">{updateError}</p>
        )}
      </SettingsSection>

      <SettingsSection title="Link to Parent" description="Enter a code from your parent to link this account">
        {linkSuccess && (
          <div className="mb-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">{linkSuccess}</div>
        )}
        <form onSubmit={handleLink} className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter link code (e.g. EKKIDS-...)"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={linking || !code.trim()}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            {linking ? 'Linking...' : 'Link'}
          </button>
        </form>
        {linkError && <p className="mt-2 text-sm text-red-600">{linkError}</p>}
      </SettingsSection>
    </div>
  )
}
