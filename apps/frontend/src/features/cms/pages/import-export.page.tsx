import { useState } from 'react'
import { useCmsAuth } from '../hooks/use-cms-auth'
import { wordsService, categoriesService } from '../services/cms-crud.service'
import type { ImportResult } from '../types/cms.types'

export function ImportExportPage() {
  const { canEdit } = useCmsAuth()

  const [importEntity, setImportEntity] = useState<'words' | 'categories'>('words')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const [exportEntity, setExportEntity] = useState<'words' | 'categories'>('words')
  const [exportLanguage, setExportLanguage] = useState('')
  const [exportCategoryId, setExportCategoryId] = useState('')
  const [exporting, setExporting] = useState(false)

  const handleImport = async () => {
    if (!importFile) return
    setImporting(true)
    setImportResult(null)
    try {
      const text = await importFile.text()
      const json = JSON.parse(text)
      const result = await wordsService.importJson(importEntity, Array.isArray(json) ? json : [json])
      setImportResult(result)
    } catch (err) {
      setImportResult({ created: 0, updated: 0, errors: 1, errorDetails: [(err as Error).message] })
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const params: Record<string, string> = {}
      if (exportLanguage) params.language = exportLanguage
      if (exportCategoryId) params.categoryId = exportCategoryId

      let data: unknown[]
      if (exportEntity === 'words') {
        data = await wordsService.exportWords(Object.keys(params).length ? params : undefined)
      } else {
        data = await categoriesService.exportCategories(Object.keys(params).length ? params : undefined)
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${exportEntity}-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Import / Export</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Import</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Entity</label>
              <select value={importEntity} onChange={(e) => setImportEntity(e.target.value as 'words' | 'categories')} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="words">Words</option>
                <option value="categories">Categories</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">File (.json)</label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={handleImport}
              disabled={!importFile || importing || !canEdit}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-40"
            >
              {importing ? 'Importing...' : 'Import'}
            </button>
            {importResult && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                <div className="font-medium text-gray-700">Results</div>
                <div className="mt-1 space-y-1 text-xs">
                  <p className="text-green-700">Created: {importResult.created}</p>
                  <p className="text-blue-700">Updated: {importResult.updated}</p>
                  <p className="text-red-700">Errors: {importResult.errors}</p>
                  {importResult.errorDetails.length > 0 && (
                    <ul className="mt-1 list-inside list-disc text-red-600">
                      {importResult.errorDetails.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Export</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Entity</label>
              <select value={exportEntity} onChange={(e) => setExportEntity(e.target.value as 'words' | 'categories')} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="words">Words</option>
                <option value="categories">Categories</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Language (optional)</label>
              <input value={exportLanguage} onChange={(e) => setExportLanguage(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category ID (optional)</label>
              <input value={exportCategoryId} onChange={(e) => setExportCategoryId(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <button
              onClick={handleExport}
              disabled={exporting || !canEdit}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-40"
            >
              {exporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
