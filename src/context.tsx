/*
 * Copyright (c) 2022-2026 AccelByte Inc. All Rights Reserved
 * This is licensed software from AccelByte Inc, for limitations
 * and restrictions contact your company contract manager.
 */

import { AccelByteSDK } from '@accelbyte/sdk'
import { type CrudRolePermission } from '@accelbyte/validator'
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
