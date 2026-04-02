import './index.css'
import { module } from './module.tsx'

if (import.meta.env.DEV) {
  // Dev mode only, we want to reset preflight to make it as same as Admin Portal as possible.
  import('./devmode.css')
}

const extendAppName = import.meta.env.VITE_EXTEND_APP_NAME
let baseURL = window.location.origin
if (import.meta.env.VITE_SINGLE_EXTEND_APP_ONLY) {
  baseURL = `${baseURL}/ext-${import.meta.env.VITE_AGS_NAMESPACE}-${extendAppName}`
}

module.mount(document.getElementById('root')!, {
  basePath: import.meta.env.VITE_BASE_PATH || '/',
  sdkConfig: {
    baseURL,
    clientId: import.meta.env.VITE_AGS_CLIENT_ID,
    namespace: import.meta.env.VITE_AGS_NAMESPACE,
    redirectURI: import.meta.env.VITE_AGS_REDIRECT_URI
  }
  // isCurrentUserHasPermission is omitted — AdminUiContextProvider falls back
  // to the dev-only implementation automatically. In production the Admin Portal
  // host passes this via HostContext.
})
