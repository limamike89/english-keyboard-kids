import { useEffect, useState } from 'react'
import { CmsTable, type Column } from '../components/cms-table'
import { CmsModal } from '../components/cms-modal'
import { CmsStatusBadge } from '../components/cms-status-badge'
import { useCmsAuth } from '../hooks/use-cms-auth'
import { getMediaList, uploadMedia, updateMedia, replaceMediaFile, deleteMedia } from '../services/cms-media.service'
import type { CmsMedia } from '../types/cms.types'

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function typeIcon(type: string) {
  if (type.startsWith('image/')) return '🖼️'
  if (type.startsWith('audio/')) return '🎵'
  if (type.startsWith('video/')) return '🎬'
  return '📄'
}

export function MediaPage() {
  const { canEdit } = useCmsAuth()
  const [data, setData] = useState<CmsMedia[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [replaceModalOpen, setReplaceModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CmsMedia | null>(null)

  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [formAltText, setFormAltText] = useState('')
  const [formLanguage, setFormLanguage] = useState('')

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await getMediaList({ page })
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

  const resetUploadForm = () => {
    setUploadFile(null)
    setFormAltText('')
    setFormLanguage('')
  }

  const openUpload = () => {
    resetUploadForm()
    setUploadModalOpen(true)
  }

  const handleUpload = async () => {
    if (!uploadFile) return
    await uploadMedia(uploadFile, formAltText || undefined, formLanguage || undefined)
    setUploadModalOpen(false)
    fetchData()
  }

  const openEdit = (item: CmsMedia) => {
    setEditingItem(item)
    setFormAltText(item.altText ?? '')
    setFormLanguage(item.language ?? '')
    setEditModalOpen(true)
  }

  const handleEdit = async () => {
    if (!editingItem) return
    await updateMedia(editingItem.id, { altText: formAltText || undefined, language: formLanguage || undefined })
    setEditModalOpen(false)
    setEditingItem(null)
    fetchData()
  }

  const openReplace = (item: CmsMedia) => {
    setEditingItem(item)
    setUploadFile(null)
    setReplaceModalOpen(true)
  }

  const handleReplace = async () => {
    if (!editingItem || !uploadFile) return
    await replaceMediaFile(editingItem.id, uploadFile)
    setReplaceModalOpen(false)
    setEditingItem(null)
    fetchData()
  }

  const handleDelete = async (item: CmsMedia) => {
    await deleteMedia(item.id)
    fetchData()
  }

  const columns: Column<CmsMedia>[] = [
    {
      key: 'preview',
      header: 'Preview',
      render: (item) => <span className="text-lg">{typeIcon(item.mimeType)}</span>,
    },
    { key: 'filename', header: 'Filename' },
    { key: 'originalName', header: 'Original Name' },
    { key: 'type', header: 'Type' },
    {
      key: 'size',
      header: 'Size',
      render: (item) => <span className="text-xs text-gray-500">{formatSize(item.size)}</span>,
    },
    {
      key: 'language',
      header: 'Language',
      render: (item) => <span className="text-xs text-gray-500">{item.language ?? '-'}</span>,
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
              <button onClick={() => openReplace(item)} className="text-sm text-amber-600 hover:text-amber-800">Replace</button>
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
        <h1 className="text-2xl font-bold text-gray-800">Media</h1>
        {canEdit && (
          <button onClick={openUpload} className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700">
            Upload Media
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

      <CmsModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Upload Media">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">File</label>
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Alt Text</label>
            <input value={formAltText} onChange={(e) => setFormAltText(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Language</label>
            <input value={formLanguage} onChange={(e) => setFormLanguage(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setUploadModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleUpload} disabled={!uploadFile} className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-40">Upload</button>
          </div>
        </div>
      </CmsModal>

      <CmsModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Media">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Alt Text</label>
            <input value={formAltText} onChange={(e) => setFormAltText(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Language</label>
            <input value={formLanguage} onChange={(e) => setFormLanguage(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setEditModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleEdit} className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700">Save</button>
          </div>
        </div>
      </CmsModal>

      <CmsModal isOpen={replaceModalOpen} onClose={() => setReplaceModalOpen(false)} title="Replace File">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">New File</label>
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setReplaceModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleReplace} disabled={!uploadFile} className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700 disabled:opacity-40">Replace</button>
          </div>
        </div>
      </CmsModal>
    </div>
  )
}
