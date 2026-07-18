import { useState } from 'react'

interface DisplayNameFormProps {
  currentName: string
  onSubmit: (name: string) => Promise<void>
}

export function DisplayNameForm({ currentName, onSubmit }: DisplayNameFormProps) {
  const [value, setValue] = useState(currentName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async () => {
    const trimmed = value.trim()
    if (!trimmed || trimmed === currentName) return
    setSaving(true)
    try {
      await onSubmit(trimmed)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex gap-3">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
        maxLength={30}
        placeholder="Tu nombre"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={saving || !value.trim() || value.trim() === currentName}
        className="rounded-lg bg-sky-500 px-5 py-2 font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50"
      >
        {saving ? '...' : saved ? '✅' : 'Guardar'}
      </button>
    </div>
  )
}
