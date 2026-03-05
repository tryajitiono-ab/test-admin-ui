import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { sdk } from './constants'
import { ContextProvider } from './context-provider'
import { FederatedElement } from './federated-element'
import type { ExtendAdminUIModule } from './types'

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

export const module: ExtendAdminUIModule = {
  mount(container, hostContext) {
    const root = createRoot(container)
    console.info('mount')
    root.render(
      <StrictMode>
        <QueryClientProvider client={client}>
          <BrowserRouter>
            <ContextProvider contextValue={{ hostContext, sdk }}>
              <FederatedElement />
            </ContextProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </StrictMode>
    )

    return () => root.unmount()
  }
}
