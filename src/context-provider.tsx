import { AccelByte, createAuthInterceptor, type Interceptor } from '@accelbyte/sdk'
import { IamUserAuthorizationClient, RolesAdminApi, RoleV4Response } from '@accelbyte/sdk-iam'
import { useUsersAdminApi_GetUsersMe_v3 } from '@accelbyte/sdk-iam/react-query'
import { getRoleIdsByNamespace, PermissionGuard, type AdminUser, type CrudRolePermission } from '@accelbyte/validator'
import { useQuery } from '@tanstack/react-query'
import { useMemo, type ReactNode } from 'react'
import { AdminUiContext, type AdminUiContextValue } from './context'
import type { SdkConfigOptions } from './types'

function detectMode(): 'development' | 'production' {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return 'production'
  }

  return 'development'
}

interface AdminUiContextProviderProps {
  sdkConfig: SdkConfigOptions
  isCurrentUserHasPermission?: (permission: CrudRolePermission) => boolean
  children: ReactNode
}

function ProdProvider({ sdkConfig, isCurrentUserHasPermission, children }: AdminUiContextProviderProps) {
  if (typeof isCurrentUserHasPermission === 'undefined') {
    return <div>Error: isCurrentUserHasPermission is not passed from the Admin Portal</div>
  }

  const contextValue: AdminUiContextValue = {
    sdk: AccelByte.SDK({ coreConfig: sdkConfig }),
    isLoading: false,
    isCurrentUserHasPermission
  }

  return <AdminUiContext.Provider value={contextValue}>{children}</AdminUiContext.Provider>
}

// What this does:
//
// 1. Exchanges auth code.
// 2. Gets current user and gets list of roles.
// 3. Creates a permission guard for development purposes.
function DevProvider({ sdkConfig, children }: AdminUiContextProviderProps) {
  const { code, error, state } = Object.fromEntries(new URL(window.location.href).searchParams)

  const sdk = useMemo(() => {
    const interceptors: Interceptor[] = []
    const sdk = AccelByte.SDK({ coreConfig: sdkConfig, axiosConfig: { interceptors } })

    interceptors.push(
      createAuthInterceptor({
        clientId: sdkConfig.clientId,
        async onSessionExpired() {
          const iamClient = new IamUserAuthorizationClient(sdk)
          if (!code && !state) {
            const refreshed = await iamClient.refreshToken()
            if (refreshed) return
            window.location.replace(iamClient.createLoginURL())
          }
        }
      })
    )

    return sdk
  }, [sdkConfig, code, state])

  // Exchange code. We bypass the `useEffect` by using `useQuery` like this, preventing double fetch in strict mode.
  const exchangeCodeResult = useQuery({
    queryKey: ['exchange-auth-code'],
    queryFn: async () => {
      try {
        await new IamUserAuthorizationClient(sdk).exchangeAuthorizationCode({ code, error, state })

        const newURL = new URL(window.location.href)
        newURL.searchParams.delete('code')
        newURL.searchParams.delete('state')
        window.history.replaceState({}, '', newURL)

        return { isError: true }
      } catch {
        return { isError: false }
      }
    },
    enabled: !!code && !!state
  })

  const currentNamespace = sdkConfig.namespace
  const {
    data: userData,
    isLoading: isUserLoading,
    error: userError
  } = useUsersAdminApi_GetUsersMe_v3(
    sdk,
    {},
    {
      enabled: !code && !state
    }
  )

  const { data: allRoles, isLoading: isRolesLoading } = useQuery<RoleV4Response[]>({
    queryKey: ['all-roles'],
    queryFn: async () => {
      const api = RolesAdminApi(sdk)
      const allData: RoleV4Response[] = []
      let offset = 0
      const LIMIT = 100

      while (true) {
        const resp = await api.getRoles_v4({ limit: LIMIT, offset })
        allData.push(...resp.data.data)
        if (!resp.data.paging.next) break
        offset += LIMIT
      }

      return allData
    },
    enabled: !!userData
  })

  const permissionGuard = useMemo(() => {
    if (!userData || !allRoles) return null

    const relevantRoleIds = getRoleIdsByNamespace(userData?.namespaceRoles || [], currentNamespace)
    const allPermissions: AdminUser['permissions'] = allRoles
      .filter(role => relevantRoleIds.includes(role.roleId))
      .flatMap(role =>
        (role.permissions ?? []).map(permission => ({
          ...permission,
          schedAction: undefined,
          schedCron: undefined,
          schedRange: undefined
        }))
      )

    const adminUser: AdminUser = {
      ...userData,
      dateOfBirth: userData.dateOfBirth ?? '',
      oldEmailAddress: userData.oldEmailAddress ?? '',
      newEmailAddress: userData.newEmailAddress ?? '',
      phoneNumber: userData.phoneNumber ?? '',
      platformId: userData.platformId ?? '',
      platformUserId: userData.platformUserId ?? '',
      userName: userData.userName ?? '',
      permissions: allPermissions
    }

    return new PermissionGuard({ user: adminUser, currentNamespace })
  }, [userData, allRoles, currentNamespace])

  const contextValue: AdminUiContextValue = {
    sdk,
    isLoading: isUserLoading || isRolesLoading,
    isCurrentUserHasPermission: permission => permissionGuard?.hasPermission(permission) ?? false
  }

  if (exchangeCodeResult.data && exchangeCodeResult.data.isError) {
    const message = userError instanceof Error ? userError.message : 'Authentication failed'
    return (
      <div style={{ padding: '20px', color: '#dc2626', fontFamily: 'sans-serif' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Authentication Error</h3>
        <p style={{ margin: '0 0 16px 0' }}>{message}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            border: '1px solid #dc2626',
            borderRadius: '4px',
            background: 'transparent',
            color: '#dc2626'
          }}>
          Retry Login
        </button>
      </div>
    )
  }

  if (isUserLoading || isRolesLoading || !permissionGuard) {
    return null
  }

  return <AdminUiContext.Provider value={contextValue}>{children}</AdminUiContext.Provider>
}

/**
 * The context for Admin UI. What it does:
 *
 * - In development mode: creates SDK instance, handles authentication, and abstracting the permission check.
 * - In production mode: creates SDK instance and forwards the permission check passed from AGS Admin Portal.
 */
export function AdminUiContextProvider({ isCurrentUserHasPermission, ...props }: AdminUiContextProviderProps) {
  return detectMode() === 'production' ? (
    <ProdProvider {...props} isCurrentUserHasPermission={isCurrentUserHasPermission} />
  ) : (
    <DevProvider {...props} />
  )
}
