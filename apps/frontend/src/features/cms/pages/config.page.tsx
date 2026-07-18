import { useEffect, useState } from 'react'
import { CmsTable, type Column } from '../components/cms-table'
import { CmsModal } from '../components/cms-modal'
import { useCmsAuth } from '../hooks/use-cms-auth'
import { configService } from '../services/cms-crud.service'
import type { CmsSetting } from '../types/cms.types'

export function ConfigPage() {
  const { canEdit } = useCmsAuth()
  const [data, setData] = useState<CmsSetting[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CmsSetting | null>(null)

  const [formKey, setFormKey] = useState('')
  const [formValue, setFormValue] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formCategory, setFormCategory] = useState('')
  const [formIsPublic, setFormIsPublic] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await configService.findAll({ page })
      setData(res.data)
      setTotalPages(res.meta.totalPages)
      setTotal(res.meta.total)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page])

  const resetForm = () => {
    setFormKey('')
    setFormValue('')
    setFormDescription('')
    setFormCategory('')
    setFormIsPublic(false)
  }

  const openCreate = () => {
    setEditingItem(null)
    resetForm()
    setModalOpen(true)
  }

  const openEdit = (item: CmsSetting) => {
    setEditingItem(item)
    setFormKey(item.key)
    setFormValue(typeof item.value === 'string' ? item.value : JSON.stringify(item.value, null, 2))
    setFormDescription(item.description ?? '')
    setFormCategory(item.category)
    setFormIsPublic(item.isPublic)
    setModalOpen(true)
  }

  const handleSave = async () => {
    let parsedValue: unknown = formValue
    try {
      parsedValue = JSON.parse(formValue)
    } catch {
      parsedValue = formValue
    }
    const body = {
      key: formKey,
      value: parsedValue,
      description: formDescription || undefined,
      category: formCategory,
      isPublic: formIsPublic,
    }
    if (editingItem) {
      await configService.update(editingItem.id, body)
    } else {
      await configService.create(body)
    }
    setModalOpen(false)
    fetchData()
  }

  const handleDelete = async (item: CmsSetting) => {
    await configService.remove(item.id)
    fetchData()
  }

  const gameConfigs = data.filter((c) => c.category === 'game')

  const columns: Column<CmsSetting>[] = [
    { key: 'key', header: 'Key' },
    {
      key: 'value',
      header: 'Value',
      render: (item) => {
        const str = typeof item.value === 'string' ? item.value : JSON.stringify(item.value)
        return <span className="text-xs text-gray-500 max-w-[200px] truncate block">{str}</span>
      },
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => <span className="text-xs text-gray-500">{item.description ?? '-'}</span>,
    },
    { key: 'category', header: 'Category' },
    {
      key: 'isPublic',
      header: 'Public',
      render: (item) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${item.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {item.isPublic ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          {canEdit && (
            <>
              <button onClick={() => openEdit(item)} className="text-sm text-sky-600 hover:text-sky-800">Edit</button>
              <button onClick={() => handleDelete(item)} className="text-sm text-red-600 hover:text-red-800">Delete</button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Configuration</h1>
        {canEdit && (
          <button onClick={openCreate} className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700">
            Create Config
          </button>
        )}
      </div>

      <CmsTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        meta={{ page, totalPages, total, limit: 10 }}
        onPageChange={setPage}
        keyExtractor={(item) => item.id}
      />

      {gameConfigs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800">Game Config</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gameConfigs.map((cfg) => (
              <div key={cfg.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm font-medium text-gray-800">{cfg.key}</div>
                <div className="mt-1 text-xs text-gray-500">
                  {typeof cfg.value === 'string' ? cfg.value : JSON.stringify(cfg.value)}
                </div>
                {cfg.description && <div className="mt-1 text-xs text-gray-400">{cfg.description}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <CmsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Config' : 'Create Config'} size="lg">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Key</label>
            <input value={formKey} onChange={(e) => setFormKey(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Value (JSON)</label>
            <textarea value={formValue} onChange={(e) => setFormValue(e.target.value)} rows={5} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={formIsPublic} onChange={(e) => setFormIsPublic(e.target.checked)} />
            <label className="text-sm font-medium text-gray-700">Public</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700">Save</button>
          </div>
        </div>
      </CmsModal>
    </div>
  )
}
