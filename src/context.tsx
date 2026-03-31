import type { AccelByteSDK } from '@accelbyte/sdk'
import { createContext, useContext } from 'react'

export interface GlobalContextType {
  sdk: AccelByteSDK
}

export const GlobalContext = createContext<GlobalContextType>(null!)
export const useGlobalContext = () => useContext(GlobalContext)
