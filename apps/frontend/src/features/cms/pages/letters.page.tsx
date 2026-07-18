import { useEffect, useState } from 'react'
import { CmsTable, type Column } from '../components/cms-table'
import { CmsModal } from '../components/cms-modal'
import { CmsStatusBadge } from '../components/cms-status-badge'
import { useCmsAuth } from '../hooks/use-cms-auth'
import { lettersService } from '../services/cms-crud.service'

interface LetterItem {
  id: string
  letter: string
  word: string
  language: string
  difficulty: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function LettersPage() {
  const { canEdit } = useCmsAuth()
  const [data, setData] = useState<LetterItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LetterItem | null>(null)

  const [formLetter, setFormLetter] = useState('')
  const [formWord, setFormWord] = useState('')
  const [formDifficulty, setFormDifficulty] = useState('easy')
  const [formLanguage, setFormLanguage] = useState('en')
  const [formIsActive, setFormIsActive] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await lettersService.findAll({ page, search: search || undefined })
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
    setFormLetter('')
    setFormWord('')
    setFormDifficulty('easy')
    setFormLanguage('en')
    setFormIsActive(true)
  }

  const openCreate = () => {
    setEditingItem(null)
    resetForm()
    setModalOpen(true)
  }

  const openEdit = (item: LetterItem) => {
    setEditingItem(item)
    setFormLetter(item.letter)
    setFormWord(item.word)
    setFormDifficulty(item.difficulty)
    setFormLanguage(item.language)
    setFormIsActive(item.isActive)
    setModalOpen(true)
  }

  const handleSave = async () => {
    const body = { letter: formLetter, word: formWord, difficulty: formDifficulty, language: formLanguage, isActive: formIsActive }
    if (editingItem) {
      await lettersService.update(editingItem.id, body)
    } else {
      await lettersService.create(body)
    }
    setModalOpen(false)
    fetchData()
  }

  const handleToggle = async (item: LetterItem) => {
    await lettersService.toggleStatus(item.id, !item.isActive)
    fetchData()
  }

  const handleDelete = async (item: LetterItem) => {
    await lettersService.remove(item.id)
    fetchData()
  }

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput)
  }

  const columns: Column<LetterItem>[] = [
    { key: 'letter', header: 'Letter' },
    { key: 'word', header: 'Word' },
    { key: 'difficulty', header: 'Difficulty' },
    { key: 'language', header: 'Language' },
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
        <h1 className="text-2xl font-bold text-gray-800">Letters</h1>
        {canEdit && (
          <button onClick={openCreate} className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700">
            Create Letter
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search letters..."
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
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

      <CmsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Letter' : 'Create Letter'}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Letter</label>
            <input value={formLetter} onChange={(e) => setFormLetter(e.target.value)} maxLength={1} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Word</label>
            <input value={formWord} onChange={(e) => setFormWord(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Difficulty</label>
            <select value={formDifficulty} onChange={(e) => setFormDifficulty(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Language</label>
            <input value={formLanguage} onChange={(e) => setFormLanguage(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
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
