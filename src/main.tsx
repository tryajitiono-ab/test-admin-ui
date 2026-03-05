import './index.css'
import { module } from './module.tsx'

module.mount(document.getElementById('root')!, {
  sdkConfig: {
    baseURL: import.meta.env.DEV ? `${window.location.origin}/proxy` : import.meta.env.VITE_AGS_URL,
    clientId: import.meta.env.VITE_AGS_CLIENT_ID,
    namespace: import.meta.env.VITE_AGS_NAMESPACE,
    redirectURI: import.meta.env.VITE_AGS_REDIRECT_URI
  }
})
