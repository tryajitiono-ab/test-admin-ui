import type { AccelByteSDK } from '@accelbyte/sdk'
import { createContext, useContext } from 'react'
import type { HostContext } from './types'

export interface GlobalContextType {
  hostContext: HostContext
  sdk: AccelByteSDK
}

export const GlobalContext = createContext<GlobalContextType>(null!)
export const useGlobalContext = () => useContext(GlobalContext)
