import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParentSettings } from './hooks/use-parent'
import { updateParentSettings } from './services/parent.service'

export function ParentSettingsPage() {
  const navigate = useNavigate()
  const { data: settings, isLoading } = useParentSettings()
  const [dailyTimeLimit, setDailyTimeLimit] = useState<number | null>(null)
  const [enableReports, setEnableReports] = useState(true)
  const [reportFrequency, setReportFrequency] = useState('weekly')
  const [loaded, setLoaded] = useState(false)

  if (!loaded && settings) {
    setDailyTimeLimit(settings.dailyTimeLimit)
    setEnableReports(settings.enableReports)
    setReportFrequency(settings.reportFrequency)
    setLoaded(true)
  }

  const handleSave = async () => {
    await updateParentSettings({ dailyTimeLimit, enableReports, reportFrequency })
    navigate('/parent/dashboard')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-300 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg py-4">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Parent Settings</h1>

      <div className="space-y-4 rounded-xl border border-sky-200 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">Daily time limit (minutes)</label>
          <input
            type="number"
            value={dailyTimeLimit ?? ''}
            onChange={(e) => setDailyTimeLimit(e.target.value ? parseInt(e.target.value, 10) : null)}
            min={0}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
            placeholder="No limit"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-600">Automatic reports</label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={enableReports} onChange={(e) => setEnableReports(e.target.checked)} className="rounded border-gray-300 text-sky-600" />
            <span className="text-sm text-gray-600">Activar informes</span>
          </label>
        </div>

        {enableReports && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-600">Frecuencia de informes</label>
            <select value={reportFrequency} onChange={(e) => setReportFrequency(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none">
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>
        )}

        <button onClick={handleSave} className="w-full rounded-lg bg-sky-600 py-2 text-sm font-medium text-white transition hover:bg-sky-700">
          Save Settings
        </button>
      </div>
    </div>
  )
}
