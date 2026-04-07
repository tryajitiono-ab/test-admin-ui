import { type ExtendappuiModule } from '@accelbyte/sdk-extend-app-ui'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FederatedElement } from './federated-element'
import './index.css'

export const module: ExtendappuiModule = {
  mount(container) {
    const root = createRoot(container)

    root.render(
      <StrictMode>
        <FederatedElement />
      </StrictMode>
    )

    return () => root.unmount()
  }
}
