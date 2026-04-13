import { AppUIContextProvider, CrudType, useAppUIContext, type AppUIModule } from '@accelbyte/sdk-extend-app-ui'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const client = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } })

export const module: AppUIModule = {
  mount(container, hostContext) {
    const root = createRoot(container)

    root.render(
      <StrictMode>
        <QueryClientProvider client={client}>
          <AppUIContextProvider sdkConfig={hostContext.sdkConfig} isCurrentUserHasPermission={hostContext.isCurrentUserHasPermission}>
            <Component />
          </AppUIContextProvider>
        </QueryClientProvider>
      </StrictMode>
    )

    return () => root.unmount()
  }
}

// eslint-disable-next-line react-refresh/only-export-components
const Component = () => {
  const { isCurrentUserHasPermission } = useAppUIContext()

  return (
    <div>
      <div>Hello world!</div>
      <div hidden={!isCurrentUserHasPermission({ action: CrudType.READ, resource: 'ADMIN:NONEXISTENTRESOURCE' })}>Hello world!</div>
    </div>
  )
}
