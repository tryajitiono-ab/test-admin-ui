import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { ContextProvider } from './context-provider'
import { FederatedElement } from './federated-element'
import { FederatedTournamentElement } from './federated-tournament-element'
import { createSdk } from './sdk'
import type { ExtendAdminUIModule } from './types'

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

export const module: ExtendAdminUIModule = {
  mount(container, hostContext) {
    const root = createRoot(container)

    root.render(
      <StrictMode>
        <QueryClientProvider client={client}>
          <BrowserRouter basename={hostContext.basePath}>
            <ContextProvider
              contextValue={{
                sdk: createSdk(hostContext.sdkConfig)
              }}>
              {import.meta.env.VITE_APP_NAME === 'gameconfigs' ? <FederatedElement /> : <FederatedTournamentElement />}
            </ContextProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </StrictMode>
    )

    return () => root.unmount()
  }
}
