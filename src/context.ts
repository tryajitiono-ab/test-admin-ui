import type { AccelByteSDK } from '@accelbyte/sdk'
import type { CrudRolePermission } from '@accelbyte/validator'
import { createContext, useContext } from 'react'

export interface AdminUiContextValue {
  sdk: AccelByteSDK
  isLoading: boolean
  isCurrentUserHasPermission: (permission: CrudRolePermission) => boolean
}

export const AdminUiContext = createContext<AdminUiContextValue | null>(null)

export function useAdminUiContext(): AdminUiContextValue {
  const ctx = useContext(AdminUiContext)
  if (!ctx) {
    throw new Error('useAdminUiContext must be used within an <AdminUiContextProvider>')
  }
  return ctx
}
