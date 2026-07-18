import { useEffect, useState } from 'react'
import { CmsTable, type Column } from '../components/cms-table'
import { CmsModal } from '../components/cms-modal'
import { CmsStatusBadge } from '../components/cms-status-badge'
import { useCmsAuth } from '../hooks/use-cms-auth'
import { languagesService } from '../services/cms-crud.service'
import type { CmsLanguage } from '../types/cms.types'

export function LanguagesPage() {
  const { canEdit } = useCmsAuth()
  const [data, setData] = useState<CmsLanguage[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CmsLanguage | null>(null)

  const [formCode, setFormCode] = useState('')
  const [formName, setFormName] = useState('')
  const [formNativeName, setFormNativeName] = useState('')
  const [formFlag, setFormFlag] = useState('')
  const [formDirection, setFormDirection] = useState('ltr')
  const [formIsDefault, setFormIsDefault] = useState(false)
  const [formIsActive, setFormIsActive] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await languagesService.findAll({ page, search: search || undefined })
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
    setFormCode('')
    setFormName('')
    setFormNativeName('')
    setFormFlag('')
    setFormDirection('ltr')
    setFormIsDefault(false)
    setFormIsActive(true)
  }

  const openCreate = () => {
    setEditingItem(null)
    resetForm()
    setModalOpen(true)
  }

  const openEdit = (item: CmsLanguage) => {
    setEditingItem(item)
    setFormCode(item.code)
    setFormName(item.name)
    setFormNativeName(item.nativeName ?? '')
    setFormFlag(item.flag ?? '')
    setFormDirection(item.direction)
    setFormIsDefault(item.isDefault)
    setFormIsActive(item.isActive)
    setModalOpen(true)
  }

  const handleSave = async () => {
    const body = {
      code: formCode,
      name: formName,
      nativeName: formNativeName || undefined,
      flag: formFlag || undefined,
      direction: formDirection,
      isDefault: formIsDefault,
      isActive: formIsActive,
    }
    if (editingItem) {
      await languagesService.update(editingItem.id, body)
    } else {
      await languagesService.create(body)
    }
    setModalOpen(false)
    fetchData()
  }

  const handleToggle = async (item: CmsLanguage) => {
    await languagesService.toggleStatus(item.id, !item.isActive)
    fetchData()
  }

  const handleSetDefault = async (item: CmsLanguage) => {
    await languagesService.update(item.id, { isDefault: true })
    fetchData()
  }

  const handleDelete = async (item: CmsLanguage) => {
    await languagesService.remove(item.id)
    fetchData()
  }

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput)
  }

  const columns: Column<CmsLanguage>[] = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    {
      key: 'nativeName',
      header: 'Native Name',
      render: (item) => <span>{item.nativeName ?? '-'}</span>,
    },
    {
      key: 'flag',
      header: 'Flag',
      render: (item) => <span className="text-lg">{item.flag ?? '-'}</span>,
    },
    { key: 'direction', header: 'Direction' },
    {
      key: 'isDefault',
      header: 'Default',
      render: (item) => item.isDefault ? (
        <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">Default</span>
      ) : <span className="text-xs text-gray-400">-</span>,
    },
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
              {!item.isDefault && (
                <button onClick={() => handleSetDefault(item)} className="text-sm text-indigo-600 hover:text-indigo-800">Set as Default</button>
              )}
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
        <h1 className="text-2xl font-bold text-gray-800">Languages</h1>
        {canEdit && (
          <button onClick={openCreate} className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700">
            Create Language
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search languages..."
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

      <CmsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Language' : 'Create Language'}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Code</label>
              <input value={formCode} onChange={(e) => setFormCode(e.target.value)} placeholder="en" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="English" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Native Name</label>
              <input value={formNativeName} onChange={(e) => setFormNativeName(e.target.value)} placeholder="English" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Flag</label>
              <input value={formFlag} onChange={(e) => setFormFlag(e.target.value)} placeholder="🇺🇸" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Direction</label>
              <select value={formDirection} onChange={(e) => setFormDirection(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="ltr">LTR</option>
                <option value="rtl">RTL</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <label className="text-sm font-medium text-gray-700">Default</label>
              <input type="checkbox" checked={formIsDefault} onChange={(e) => setFormIsDefault(e.target.checked)} />
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
