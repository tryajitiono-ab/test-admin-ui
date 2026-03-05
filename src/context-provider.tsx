import type { PropsWithChildren } from 'react'
import { GlobalContext, type GlobalContextType } from './context'

export function ContextProvider({ children, contextValue }: PropsWithChildren<{ contextValue: GlobalContextType }>) {
  return <GlobalContext.Provider value={contextValue}>{children}</GlobalContext.Provider>
}
