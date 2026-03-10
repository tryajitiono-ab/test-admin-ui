import { AccelByte, createAuthInterceptor, type Interceptor, type SdkConstructorParam } from '@accelbyte/sdk'
import { IamUserAuthorizationClient } from '@accelbyte/sdk-iam'

export function createSdk(coreConfig: SdkConstructorParam['coreConfig'], loginCoreConfig: SdkConstructorParam['coreConfig'] = coreConfig) {
  const interceptors: Interceptor[] = []
  if (import.meta.env.DEV) {
    interceptors.push(
      createAuthInterceptor({
        clientId: import.meta.env.VITE_AGS_CLIENT_ID,
        async onSessionExpired() {
          let hasRefreshedToken = false

          const { code, state } = Object.fromEntries(new URL(window.location.href).searchParams)
          if (!code && !state) {
            const result = await new IamUserAuthorizationClient(loginSdk).refreshToken()
            if (result) {
              hasRefreshedToken = true
            }
          }

          if (!hasRefreshedToken) {
            window.location.replace(new IamUserAuthorizationClient(loginSdk).createLoginURL())
          }
        }
      })
    )
  }

  const loginSdk = AccelByte.SDK({
    coreConfig: loginCoreConfig
  })

  const sdk = AccelByte.SDK({
    coreConfig,
    axiosConfig: {
      interceptors
    }
  })

  return sdk
}
