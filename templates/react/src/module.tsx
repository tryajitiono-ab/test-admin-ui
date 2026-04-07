import { AdminUiContextProvider, type ExtendAdminUIModule } from '@accelbyte/sdk-extend-app-ui'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { FederatedElement } from './federated-element'

const client = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } })

export const module: ExtendAdminUIModule = {
  mount(container, hostContext) {
    const root = createRoot(container)
    const sdkConfig = { ...hostContext.sdkConfig }

    const extendAppName = import.meta.env.VITE_AB_EXTEND_APP_NAME
    if (import.meta.env.VITE_SINGLE_EXTEND_APP_ONLY) {
      sdkConfig.baseURL = `${sdkConfig.baseURL}/ext-${import.meta.env.VITE_AB_NAMESPACE}-${extendAppName}`
    }

    root.render(
      <StrictMode>
        <QueryClientProvider client={client}>
          <BrowserRouter basename={hostContext.basePath}>
            <AdminUiContextProvider sdkConfig={hostContext.sdkConfig} isCurrentUserHasPermission={hostContext.isCurrentUserHasPermission}>
              <FederatedElement />
            </AdminUiContextProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </StrictMode>
    )

    return () => root.unmount()
  }
}
