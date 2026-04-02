// This module.tsx will import { AdminUiContextProvider, createSdk, ExtendAdminUIModule }
// from '@accelbyte/extend-admin-ui-sdk' once the SDK package is published.
// For now, we use the local implementations.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { AdminUiContextProvider } from './context-provider'
import { FederatedTournamentElement } from './federated-tournament-element'
import type { ExtendAdminUIModule } from './types'

const client = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } })

export const module: ExtendAdminUIModule = {
  mount(container, hostContext) {
    const root = createRoot(container)

    root.render(
      <StrictMode>
        <QueryClientProvider client={client}>
          <BrowserRouter basename={hostContext.basePath}>
            <AdminUiContextProvider sdkConfig={hostContext.sdkConfig} isCurrentUserHasPermission={hostContext.isCurrentUserHasPermission}>
              <FederatedTournamentElement />
            </AdminUiContextProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </StrictMode>
    )

    return () => root.unmount()
  }
}
