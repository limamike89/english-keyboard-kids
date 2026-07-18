import { Navigate, Outlet } from 'react-router-dom'
import { useCmsAuthStore } from './hooks/use-cms-auth'
import { CmsSidebar } from './components/cms-sidebar'
import { CmsBreadcrumb } from './components/cms-breadcrumb'

export function CmsLayout() {
  const { isAuthenticated } = useCmsAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/cms/login" replace />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <CmsSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <CmsBreadcrumb />
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                useCmsAuthStore.getState().logout()
                window.location.href = '/cms/login'
              }}
              className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
