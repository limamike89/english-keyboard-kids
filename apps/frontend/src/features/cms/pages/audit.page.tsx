import { useEffect, useState } from 'react'
import { CmsTable, type Column } from '../components/cms-table'
import { CmsModal } from '../components/cms-modal'
import { getAuditLog } from '../services/cms-audit.service'
import type { AuditEntry } from '../types/cms.types'

const actionBadge: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
}

export function AuditPage() {
  const [data, setData] = useState<AuditEntry[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [filterEntityType, setFilterEntityType] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewEntry, setViewEntry] = useState<AuditEntry | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const params: Record<string, string> = { page: String(page) }
      if (filterEntityType) params.entityType = filterEntityType
      if (filterAction) params.action = filterAction
      if (filterStartDate) params.startDate = filterStartDate
      if (filterEndDate) params.endDate = filterEndDate
      const res = await getAuditLog(params)
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

  const handleFilter = () => {
    setPage(1)
    fetchData()
  }

  const openView = (item: AuditEntry) => {
    setViewEntry(item)
    setViewModalOpen(true)
  }

  const columns: Column<AuditEntry>[] = [
    { key: 'entityType', header: 'Entity Type' },
    {
      key: 'entityId',
      header: 'Entity ID',
      render: (item) => <span className="font-mono text-xs">{item.entityId.length > 12 ? `${item.entityId.slice(0, 12)}...` : item.entityId}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      render: (item) => (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${actionBadge[item.action] ?? 'bg-gray-100 text-gray-700'}`}>
          {item.action}
        </span>
      ),
    },
    {
      key: 'fieldName',
      header: 'Field',
      render: (item) => <span className="text-xs text-gray-500">{item.fieldName ?? '-'}</span>,
    },
    {
      key: 'user',
      header: 'User',
      render: (item) => <span className="text-xs text-gray-500">{item.user?.displayName ?? item.userId ?? '-'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (item) => <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <button onClick={() => openView(item)} className="text-sm text-sky-600 hover:text-sky-800">View</button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Audit Log</h1>

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-gray-600">Entity Type</label>
          <input value={filterEntityType} onChange={(e) => setFilterEntityType(e.target.value)} className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Action</label>
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Start Date</label>
          <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">End Date</label>
          <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <button onClick={handleFilter} className="rounded-lg bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300">Filter</button>
      </div>

      <CmsTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        meta={{ page, totalPages, total, limit: 10 }}
        onPageChange={setPage}
        keyExtractor={(item) => item.id}
        emptyMessage="No audit entries found"
      />

      <CmsModal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Audit Details" size="lg">
        {viewEntry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium text-gray-600">Entity Type:</span> {viewEntry.entityType}</div>
              <div><span className="font-medium text-gray-600">Entity ID:</span> {viewEntry.entityId}</div>
              <div><span className="font-medium text-gray-600">Action:</span> {viewEntry.action}</div>
              <div><span className="font-medium text-gray-600">Field:</span> {viewEntry.fieldName ?? '-'}</div>
              <div><span className="font-medium text-gray-600">User:</span> {viewEntry.user?.displayName ?? viewEntry.userId ?? '-'}</div>
              <div><span className="font-medium text-gray-600">Date:</span> {new Date(viewEntry.createdAt).toLocaleString()}</div>
            </div>
            {viewEntry.oldValue !== undefined && (
              <div>
                <h4 className="mb-1 text-sm font-medium text-gray-700">Old Value</h4>
                <pre className="max-h-48 overflow-auto rounded-lg bg-gray-50 p-3 text-xs font-mono text-gray-700">
                  {JSON.stringify(viewEntry.oldValue, null, 2)}
                </pre>
              </div>
            )}
            {viewEntry.newValue !== undefined && (
              <div>
                <h4 className="mb-1 text-sm font-medium text-gray-700">New Value</h4>
                <pre className="max-h-48 overflow-auto rounded-lg bg-gray-50 p-3 text-xs font-mono text-gray-700">
                  {JSON.stringify(viewEntry.newValue, null, 2)}
                </pre>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Close</button>
            </div>
          </div>
        )}
      </CmsModal>
    </div>
  )
}
