import { AccelByte, createAuthInterceptor, type Interceptor } from '@accelbyte/sdk'
import { IamUserAuthorizationClient } from '@accelbyte/sdk-iam'
import { Key_UsersAdmin, useRolesAdminApi_GetRoles_v4, useUsersAdminApi_GetUsersMe_v3 } from '@accelbyte/sdk-iam/react-query'
import { PermissionGuard, getRoleIdsByNamespace, type AdminUser, type CrudRolePermission } from '@accelbyte/validator'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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

function DevProvider({ sdkConfig, children }: Omit<AdminUiContextProviderProps, 'isCurrentUserHasPermission'>) {
  const queryClient = useQueryClient()
  const { code, error, state } = Object.fromEntries(new URL(window.location.href).searchParams)

  const sdk = useMemo(() => {
    const interceptors: Interceptor[] = [
      createAuthInterceptor({
        clientId: sdkConfig.clientId,
        async onSessionExpired() {
          const iamClient = new IamUserAuthorizationClient(sdk)
          if (!code && !state) {
            const refreshed = await iamClient.refreshToken()
            if (refreshed) return

            window.location.replace(iamClient.createLoginURL())
            return
          }
        }
      })
    ]

    const sdk = AccelByte.SDK({
      coreConfig: sdkConfig,
      axiosConfig: { interceptors }
    })

    return sdk
  }, [sdkConfig, code, state])

  const exchangeCodeResult = useQuery({
    queryKey: ['exchange-auth-code'],
    queryFn: async () => {
      try {
        await new IamUserAuthorizationClient(sdk).exchangeAuthorizationCode({ code, error, state })
        queryClient.invalidateQueries({ queryKey: [Key_UsersAdmin.UsersMe_v3] })

        const newURL = new URL(window.location.href)
        newURL.searchParams.delete('code')
        newURL.searchParams.delete('state')
        window.history.replaceState({}, '', newURL)

        return { ok: true }
      } catch {
        return { ok: false }
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

  const { data: rolesData, isLoading: isRolesLoading } = useRolesAdminApi_GetRoles_v4(
    sdk,
    { queryParams: { limit: 100 } },
    { enabled: !!userData }
  )

  const permissionGuard = useMemo(() => {
    if (!userData || !rolesData) return null

    const relevantRoleIds = getRoleIdsByNamespace(userData?.namespaceRoles || [], currentNamespace)
    const allPermissions: AdminUser['permissions'] = rolesData.data
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
  }, [userData, rolesData, currentNamespace])

  const contextValue: AdminUiContextValue = {
    sdk,
    isLoading: isUserLoading || isRolesLoading,
    isCurrentUserHasPermission: permission => permissionGuard?.hasPermission(permission) ?? false
  }

  if (exchangeCodeResult.data && !exchangeCodeResult.data.ok) {
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
