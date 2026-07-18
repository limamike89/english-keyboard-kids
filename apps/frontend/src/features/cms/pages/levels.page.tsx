import { useEffect, useState } from 'react'
import { CmsTable, type Column } from '../components/cms-table'
import { CmsModal } from '../components/cms-modal'
import { CmsStatusBadge } from '../components/cms-status-badge'
import { useCmsAuth } from '../hooks/use-cms-auth'
import { levelsService } from '../services/cms-crud.service'
import type { CmsLevel } from '../types/cms.types'

export function LevelsPage() {
  const { canEdit } = useCmsAuth()
  const [data, setData] = useState<CmsLevel[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CmsLevel | null>(null)

  const [formMode, setFormMode] = useState('LETTERS')
  const [formTitle, setFormTitle] = useState('')
  const [formLanguage, setFormLanguage] = useState('en')
  const [formDescription, setFormDescription] = useState('')
  const [formLevel, setFormLevel] = useState(1)
  const [formOrder, setFormOrder] = useState(0)
  const [formQuestionCount, setFormQuestionCount] = useState(0)
  const [formIsActive, setFormIsActive] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await levelsService.findAll({ page, search: search || undefined })
      setData(res.data)
      setTotalPages(res.meta.totalPages)
      setTotal(res.meta.total)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, search])

  const resetForm = () => {
    setFormMode('LETTERS')
    setFormTitle('')
    setFormLanguage('en')
    setFormDescription('')
    setFormLevel(1)
    setFormOrder(0)
    setFormQuestionCount(0)
    setFormIsActive(true)
  }

  const openCreate = () => {
    setEditingItem(null)
    resetForm()
    setModalOpen(true)
  }

  const openEdit = (item: CmsLevel) => {
    setEditingItem(item)
    setFormMode(item.mode)
    setFormTitle(item.title)
    setFormLanguage(item.language)
    setFormDescription(item.description ?? '')
    setFormLevel(item.level)
    setFormOrder(item.order)
    setFormQuestionCount(item.questionCount)
    setFormIsActive(item.isActive)
    setModalOpen(true)
  }

  const handleSave = async () => {
    const body = {
      mode: formMode,
      title: formTitle,
      language: formLanguage,
      description: formDescription || undefined,
      level: formLevel,
      order: formOrder,
      questionCount: formQuestionCount,
      isActive: formIsActive,
    }
    if (editingItem) {
      await levelsService.update(editingItem.id, body)
    } else {
      await levelsService.create(body)
    }
    setModalOpen(false)
    fetchData()
  }

  const handleToggle = async (item: CmsLevel) => {
    await levelsService.toggleStatus(item.id, !item.isActive)
    fetchData()
  }

  const handleDelete = async (item: CmsLevel) => {
    await levelsService.remove(item.id)
    fetchData()
  }

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput)
  }

  const columns: Column<CmsLevel>[] = [
    { key: 'title', header: 'Title' },
    {
      key: 'mode',
      header: 'Mode',
      render: (item) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
          item.mode === 'LETTERS' ? 'bg-blue-100 text-blue-700' :
          item.mode === 'NUMBERS' ? 'bg-purple-100 text-purple-700' :
          'bg-orange-100 text-orange-700'
        }`}>
          {item.mode}
        </span>
      ),
    },
    { key: 'language', header: 'Language' },
    { key: 'level', header: 'Level' },
    { key: 'questionCount', header: 'Questions' },
    {
      key: 'isActive',
      header: 'Status',
      render: (item) => <CmsStatusBadge isActive={item.isActive} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          {canEdit && (
            <>
              <button onClick={() => openEdit(item)} className="text-sm text-sky-600 hover:text-sky-800">Edit</button>
              <button onClick={() => handleToggle(item)} className="text-sm text-amber-600 hover:text-amber-800">
                {item.isActive ? 'Deactivate' : 'Activate'}
              </button>
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
        <h1 className="text-2xl font-bold text-gray-800">Levels</h1>
        {canEdit && (
          <button onClick={openCreate} className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700">
            Create Level
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search levels..."
          className="w-80 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} className="rounded-lg bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300">Search</button>
        {search && <button onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }} className="text-sm text-gray-500 hover:text-gray-700">Clear</button>}
      </div>

      <CmsTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        meta={{ page, totalPages, total, limit: 10 }}
        onPageChange={setPage}
        keyExtractor={(item) => item.id}
      />

      <CmsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Level' : 'Create Level'} size="lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mode</label>
              <select value={formMode} onChange={(e) => setFormMode(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="LETTERS">LETTERS</option>
                <option value="NUMBERS">NUMBERS</option>
                <option value="MIXED">MIXED</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <input value={formLanguage} onChange={(e) => setFormLanguage(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Level</label>
              <input type="number" value={formLevel} onChange={(e) => setFormLevel(Number(e.target.value))} min={1} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Order</label>
              <input type="number" value={formOrder} onChange={(e) => setFormOrder(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Question Count</label>
              <input type="number" value={formQuestionCount} onChange={(e) => setFormQuestionCount(Number(e.target.value))} min={0} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Active</label>
            <input type="checkbox" checked={formIsActive} onChange={(e) => setFormIsActive(e.target.checked)} />
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
