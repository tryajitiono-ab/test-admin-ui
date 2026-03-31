import type { SdkConstructorParam } from '@accelbyte/sdk'

// TODO: move this to external package.
export interface ExtendAdminUIModule {
  // Mount function, when called, returns unmount function. This can be used
  // to clean up event handlers, etc.
  mount(container: HTMLElement, context: HostContext): () => void
}

export interface HostContext {
  basePath: string
  sdkConfig: SdkConstructorParam['coreConfig']
  loginSdkConfig?: SdkConstructorParam['coreConfig']
}
