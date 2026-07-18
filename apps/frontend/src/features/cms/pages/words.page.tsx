import { useEffect, useState } from 'react'
import { CmsTable, type Column } from '../components/cms-table'
import { CmsModal } from '../components/cms-modal'
import { CmsStatusBadge } from '../components/cms-status-badge'
import { useCmsAuth } from '../hooks/use-cms-auth'
import { wordsService, categoriesService } from '../services/cms-crud.service'
import type { CmsCategory } from '../types/cms.types'

interface WordItem {
  id: string
  word: string
  letter: string
  language: string
  difficulty: string
  categoryId?: string
  category?: { name: string; slug: string }
  tags: string[]
  description?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function WordsPage() {
  const { canEdit } = useCmsAuth()
  const [data, setData] = useState<WordItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WordItem | null>(null)
  const [categories, setCategories] = useState<CmsCategory[]>([])

  const [formWord, setFormWord] = useState('')
  const [formLetter, setFormLetter] = useState('')
  const [formLanguage, setFormLanguage] = useState('en')
  const [formDifficulty, setFormDifficulty] = useState('easy')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formTags, setFormTags] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formOrder, setFormOrder] = useState(0)
  const [formIsActive, setFormIsActive] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await wordsService.findAll({ page, search: search || undefined })
      setData(res.data)
      setTotalPages(res.meta.totalPages)
      setTotal(res.meta.total)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await categoriesService.findAll()
      setCategories(res.data)
    } catch {
      // silently fail
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, search])

  useEffect(() => {
    fetchCategories()
  }, [])

  const resetForm = () => {
    setFormWord('')
    setFormLetter('')
    setFormLanguage('en')
    setFormDifficulty('easy')
    setFormCategoryId('')
    setFormTags('')
    setFormDescription('')
    setFormOrder(0)
    setFormIsActive(true)
  }

  const openCreate = () => {
    setEditingItem(null)
    resetForm()
    setModalOpen(true)
  }

  const openEdit = (item: WordItem) => {
    setEditingItem(item)
    setFormWord(item.word)
    setFormLetter(item.letter)
    setFormLanguage(item.language)
    setFormDifficulty(item.difficulty)
    setFormCategoryId(item.categoryId ?? '')
    setFormTags(Array.isArray(item.tags) ? item.tags.join(', ') : '')
    setFormDescription(item.description ?? '')
    setFormOrder(item.order)
    setFormIsActive(item.isActive)
    setModalOpen(true)
  }

  const handleSave = async () => {
    const tags = formTags.split(',').map((t) => t.trim()).filter(Boolean)
    const body = {
      word: formWord,
      letter: formLetter,
      language: formLanguage,
      difficulty: formDifficulty,
      categoryId: formCategoryId || undefined,
      tags,
      description: formDescription || undefined,
      order: formOrder,
      isActive: formIsActive,
    }
    if (editingItem) {
      await wordsService.update(editingItem.id, body)
    } else {
      await wordsService.create(body)
    }
    setModalOpen(false)
    fetchData()
  }

  const handleToggle = async (item: WordItem) => {
    await wordsService.toggleStatus(item.id, !item.isActive)
    fetchData()
  }

  const handleDelete = async (item: WordItem) => {
    await wordsService.remove(item.id)
    fetchData()
  }

  const handleSearch = () => {
    setPage(1)
    setSearch(searchInput)
  }

  const columns: Column<WordItem>[] = [
    { key: 'word', header: 'Word' },
    { key: 'letter', header: 'Letter' },
    { key: 'language', header: 'Language' },
    { key: 'difficulty', header: 'Difficulty' },
    {
      key: 'category',
      header: 'Category',
      render: (item) => <span>{item.category?.name ?? item.categoryId ?? '-'}</span>,
    },
    {
      key: 'tags',
      header: 'Tags',
      render: (item) => {
        const tagList = Array.isArray(item.tags) ? item.tags : []
        return <span className="text-xs text-gray-500">{tagList.join(', ') || '-'}</span>
      },
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
        <h1 className="text-2xl font-bold text-gray-800">Words</h1>
        {canEdit && (
          <button onClick={openCreate} className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700">
            Create Word
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by word, language, difficulty, letter..."
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

      <CmsModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? 'Edit Word' : 'Create Word'} size="lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Word</label>
              <input value={formWord} onChange={(e) => setFormWord(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Letter</label>
              <input value={formLetter} onChange={(e) => setFormLetter(e.target.value)} maxLength={1} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <input value={formLanguage} onChange={(e) => setFormLanguage(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
              <select value={formDifficulty} onChange={(e) => setFormDifficulty(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select value={formCategoryId} onChange={(e) => setFormCategoryId(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
              <input value={formTags} onChange={(e) => setFormTags(e.target.value)} placeholder="noun, animal, color" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
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
            <div className="flex items-center gap-2 pt-6">
              <label className="text-sm font-medium text-gray-700">Active</label>
              <input type="checkbox" checked={formIsActive} onChange={(e) => setFormIsActive(e.target.checked)} />
            </div>
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
