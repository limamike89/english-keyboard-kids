import { useEffect, useState } from 'react'
import { CmsTable, type Column } from '../components/cms-table'
import { CmsModal } from '../components/cms-modal'
import { CmsStatusBadge } from '../components/cms-status-badge'
import { useCmsAuth } from '../hooks/use-cms-auth'
import { achievementsService } from '../services/cms-crud.service'
import type { CmsAchievement } from '../types/cms.types'

const CATEGORIES = ['STREAK', 'SCORE', 'COMPLETION', 'ACCURACY', 'SPECIAL'] as const

export function AchievementsPage() {
  const { canEdit } = useCmsAuth()
  const [data, setData] = useState<CmsAchievement[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CmsAchievement | null>(null)

  const [formKey, setFormKey] = useState('')
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formIcon, setFormIcon] = useState('')
  const [formCategory, setFormCategory] = useState('STREAK')
  const [formGroup, setFormGroup] = useState('')
  const [formXpReward, setFormXpReward] = useState(0)
  const [formCoinsReward, setFormCoinsReward] = useState(0)
  const [formMaxProgress, setFormMaxProgress] = useState(1)
  const [formIsActive, setFormIsActive] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await achievementsService.findAll({ page, search: search || undefined })
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
    setFormKey('')
    setFormName('')
    setFormDescription('')
    setFormIcon('')
    setFormCategory('STREAK')
    setFormGroup('')
    setFormXpReward(0)
    setFormCoinsReward(0)
    setFormMaxProgress(1)
    setFormIsActive(true)
  }

  const openCreate = () => {
    setEditingItem(null)
    resetForm()
    setModalOpen(true)
  }

  const openEdit = (item: CmsAchievement) => {
    setEditingItem(item)
    setFormKey(item.key)
    setFormName(item.name)
    setFormDescription(item.description)
    setFormIcon(item.icon)
    setFormCategory(item.category)
    setFormGroup(item.group ?? '')
    setFormXpReward(item.xpReward)
    setFormCoinsReward(item.coinsReward)
    setFormMaxProgress(item.maxProgress)
    setFormIsActive(item.isActive)
    setModalOpen(true)
  }

  const handleSave = async () => {
    const body = {
      key: formKey || formName.toLowerCase().replace(/\s+/g, '_'),
      name: formName,
      description: formDescription,
      icon: formIcon,
      category: formCategory,
      group: formGroup || undefined,
      xpReward: formXpReward,
      coinsReward: formCoinsReward,
      maxProgress: formMaxProgress,
      isActive: formIsActive,
    }
    if (editingItem) {
      await achievementsService.update(editingItem.id, body)
    } else {
      await achievementsService.create(body)
    }
    setModalOpen(false)
    fetchData()
  }

  const handleToggle = async (item: CmsAchievement) => {
    await achievementsService.toggleStatus(item.id, !item.isActive)
    fetchData()
  }

  const handleDelete = async (item: CmsAchievement) => {
    await achievementsService.remove(item.id)
    fetchData()
  }

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput)
  }

  const columns: Column<CmsAchievement>[] = [
    { key: 'key', header: 'Key' },
    { key: 'name', header: 'Name' },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
          item.category === 'STREAK' ? 'bg-rose-100 text-rose-700' :
          item.category === 'SCORE' ? 'bg-blue-100 text-blue-700' :
          item.category === 'COMPLETION' ? 'bg-green-100 text-green-700' :
          item.category === 'ACCURACY' ? 'bg-purple-100 text-purple-700' :
          'bg-amber-100 text-amber-700'
        }`}>
          {item.category}
        </span>
      ),
    },
    { key: 'xpReward', header: 'XP' },
    { key: 'coinsReward', header: 'Coins' },
    { key: 'maxProgress', header: 'Max Progress' },
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
        <h1 className="text-2xl font-bold text-gray-800">Achievements</h1>
        {canEdit && (
          <button onClick={openCreate} className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700">
            Create Achievement
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search achievements..."
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

      <CmsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Achievement' : 'Create Achievement'} size="lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                value={formName}
                onChange={(e) => { setFormName(e.target.value); if (!editingItem) setFormKey(e.target.value.toLowerCase().replace(/\s+/g, '_')) }}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Key</label>
              <input value={formKey} onChange={(e) => setFormKey(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Icon</label>
              <input value={formIcon} onChange={(e) => setFormIcon(e.target.value)} placeholder="emoji or icon class" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Group</label>
              <input value={formGroup} onChange={(e) => setFormGroup(e.target.value)} placeholder="optional group name" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Progress</label>
              <input type="number" value={formMaxProgress} onChange={(e) => setFormMaxProgress(Number(e.target.value))} min={1} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">XP Reward</label>
              <input type="number" value={formXpReward} onChange={(e) => setFormXpReward(Number(e.target.value))} min={0} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Coins Reward</label>
              <input type="number" value={formCoinsReward} onChange={(e) => setFormCoinsReward(Number(e.target.value))} min={0} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
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
