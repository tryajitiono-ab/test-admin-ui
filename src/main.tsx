import './index.css'
import { module } from './module.tsx'

const extendAppName = import.meta.env.VITE_EXTEND_APP_NAME
const loginBaseURL = import.meta.env.DEV ? `${window.location.origin}/proxy` : import.meta.env.VITE_AGS_URL
let baseURL = loginBaseURL
if (extendAppName) {
  baseURL += `/ext-${import.meta.env.VITE_AGS_GAME_NAMESPACE}-${extendAppName}`
}

module.mount(document.getElementById('root')!, {
  sdkConfig: {
    baseURL,
    clientId: import.meta.env.VITE_AGS_CLIENT_ID,
    namespace: import.meta.env.VITE_AGS_GAME_NAMESPACE,
    redirectURI: import.meta.env.VITE_AGS_REDIRECT_URI
  },
  loginSdkConfig: {
    baseURL: loginBaseURL,
    clientId: import.meta.env.VITE_AGS_CLIENT_ID,
    namespace: import.meta.env.VITE_AGS_NAMESPACE,
    redirectURI: import.meta.env.VITE_AGS_REDIRECT_URI
  }
})
