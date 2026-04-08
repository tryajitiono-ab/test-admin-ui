import { module } from './module.tsx'

const baseURL = window.location.origin

module.mount(document.getElementById('root')!, {
  basePath: import.meta.env.VITE_BASE_PATH || '/',
  sdkConfig: {
    baseURL,
    // These are unused in this minimal template — no AGS API calls are made.
    // See the `react` template for a complete example that connects to AGS.
    clientId: '',
    namespace: '',
    redirectURI: ''
  }
  // isCurrentUserHasPermission is omitted — appuiContextProvider falls back
  // to the dev-only implementation automatically. In production the Admin Portal
  // host passes this via HostContext.
})
