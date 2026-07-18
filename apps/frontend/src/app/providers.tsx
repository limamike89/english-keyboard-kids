import { type ReactNode, useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MultimediaProvider } from '@/multimedia-engine/react/multimedia-context'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { createSession } from '@/features/auth/services/auth.service'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

interface ProvidersProps {
  children: ReactNode
}

function AuthGate({ children }: { children: ReactNode }) {
  const sessionToken = useAuthStore((s) => s.sessionToken)
  const setSession = useAuthStore((s) => s.setSession)
  const [ready, setReady] = useState(!!sessionToken)

  useEffect(() => {
    if (sessionToken) {
      setReady(true)
      return
    }
    let cancelled = false
    createSession()
      .then((session) => {
        if (!cancelled) {
          setSession(session)
          setReady(true)
        }
      })
      .catch(() => {
        if (!cancelled) setReady(true)
      })
    return () => { cancelled = true }
  }, [sessionToken, setSession])

  if (!ready) return null
  return <>{children}</>
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MultimediaProvider>
          <AuthGate>
            {children}
          </AuthGate>
        </MultimediaProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
