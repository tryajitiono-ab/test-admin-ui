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
    const loginSdkConfig = hostContext.loginSdkConfig ?? hostContext.sdkConfig

    root.render(
      <StrictMode>
        <QueryClientProvider client={client}>
          <BrowserRouter>
            <ContextProvider
              contextValue={{
                sdk: createSdk(hostContext.sdkConfig, loginSdkConfig),
                loginSdk: createSdk(loginSdkConfig)
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
