import { Providers } from './app/providers'
import { AppRouter } from './app/routes'

export function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  )
}
