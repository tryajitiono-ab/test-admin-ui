// These types will be imported from @accelbyte/extend-admin-ui-sdk once the
// SDK package is published. For now we define them locally.
//
// The SDK re-exports CrudType, CrudBitType, and CrudRolePermission from
// @accelbyte/validator (bundled, not a peer dependency).

import type { SdkConstructorParam } from '@accelbyte/sdk'

/**
 * SDK configuration options for Extend Admin UI.
 * Derived from CoreConfig in @accelbyte/sdk. Using a type alias ensures
 * we stay in sync with the core SDK without hand-maintaining a duplicate type.
 */
export type SdkConfigOptions = SdkConstructorParam['coreConfig']

// -- Permission types (mirroring @accelbyte/validator) -----------------------

export const CrudType = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE'
} as const
export type CrudType = (typeof CrudType)[keyof typeof CrudType]

export const CrudBitType = {
  Create: 1,
  Read: 2,
  Update: 4,
  Delete: 8
} as const
export type CrudBitType = (typeof CrudBitType)[keyof typeof CrudBitType]

export interface CrudRolePermission {
  resource: string
  action: CrudType
}

// -- SDK interfaces ----------------------------------------------------------

export interface HostContext {
  /**
   * The main SDK config that is used to fetch services in AGS.
   */
  sdkConfig: SdkConfigOptions
  /**
   * The base path of the application. This is only used in production.
   * Pass this to the `basename` prop of the Router if you are using
   * react-router.
   */
  basePath: string
  /**
   * Checks if the current user has permission.
   * Uses @accelbyte/validator's CrudRolePermission ({ resource: string, action: CrudType }).
   *
   * In production the host (Admin Portal) provides this function.
   * When omitted (local development), the AdminUiContextProvider falls back to
   * a dev-only implementation that uses PermissionGuard internally.
   */
  isCurrentUserHasPermission?: (permission: CrudRolePermission) => boolean
}

export interface ExtendAdminUIModule {
  /**
   * Mount function, when called, returns unmount function. This can be used
   * to clean up event handlers, etc.
   */
  mount(container: HTMLElement, context: HostContext): () => void
}
