import { AccelByte, createAuthInterceptor, type Interceptor } from '@accelbyte/sdk'
import { IamUserAuthorizationClient } from '@accelbyte/sdk-iam'

const interceptors: Interceptor[] = []
if (import.meta.env.DEV) {
  interceptors.push(
    createAuthInterceptor({
      clientId: import.meta.env.VITE_AGS_CLIENT_ID,
      async onSessionExpired() {
        let hasRefreshedToken = false

        const { code, state } = Object.fromEntries(new URL(window.location.href).searchParams)
        if (!code && !state) {
          const result = await new IamUserAuthorizationClient(sdk).refreshToken()
          if (result) {
            hasRefreshedToken = true
          }
        }

        if (!hasRefreshedToken) {
          window.location.replace(new IamUserAuthorizationClient(sdk).createLoginURL())
        }
      }
    })
  )
}

export const sdk = AccelByte.SDK({
  coreConfig: {
    baseURL: import.meta.env.DEV ? `${window.location.origin}/proxy` : import.meta.env.VITE_AGS_URL,
    clientId: import.meta.env.VITE_AGS_CLIENT_ID,
    namespace: import.meta.env.VITE_AGS_NAMESPACE,
    redirectURI: import.meta.env.VITE_AGS_REDIRECT_URI
  },
  axiosConfig: {
    interceptors
  }
})
