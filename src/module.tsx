// This module.tsx will import { AdminUiContextProvider, createSdk, ExtendAdminUIModule }
// from '@accelbyte/sdk-extend-app-ui' once the SDK package is published.
// For now, we use the local implementations.

import { AdminUiContextProvider, type ExtendAdminUIModule } from '@accelbyte/sdk-extend-app-ui'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { FederatedTournamentElement } from './federated-tournament-element'

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
