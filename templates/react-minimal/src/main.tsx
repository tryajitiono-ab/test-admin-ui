import { module } from './module.tsx'

const baseURL = window.location.origin

module.mount(document.getElementById('root')!, {
  basePath: import.meta.env.VITE_BASE_PATH || '/',
  sdkConfig: {
    baseURL,
    clientId: import.meta.env.VITE_AB_CLIENT_ID,
    namespace: import.meta.env.VITE_AB_NAMESPACE,
    redirectURI: import.meta.env.VITE_AGS_REDIRECT_URI
  }
  // isCurrentUserHasPermission is omitted — AdminUiContextProvider falls back
  // to the dev-only implementation automatically. In production the Admin Portal
  // host passes this via HostContext.
})
