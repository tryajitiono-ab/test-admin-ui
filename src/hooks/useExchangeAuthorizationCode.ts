import { IamUserAuthorizationClient } from '@accelbyte/sdk-iam'
import { useUsersAdminApi_GetUsersMe_v3 } from '@accelbyte/sdk-iam/react-query'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { useGlobalContext } from '../context'

/**
 * Authenticates the current user and, on first mount, exchanges any OAuth
 * authorization code present in the URL query string before stripping the
 * `code` and `state` parameters from the URL.
 */
export function useExchangeAuthorizationCode() {
  const { loginSdk } = useGlobalContext()
  useUsersAdminApi_GetUsersMe_v3(loginSdk, {})
  const [, setSearchParams] = useSearchParams()

  useEffect(() => {
    const { code, state } = Object.fromEntries(new URL(window.location.href).searchParams)
    if (!code || !state) return

    new IamUserAuthorizationClient(loginSdk).exchangeAuthorizationCode({ code, state })

    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.delete('code')
      next.delete('state')
      return next
    })
  }, [])
}
