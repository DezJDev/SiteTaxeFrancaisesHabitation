'use client'

import { createContext, useContext } from 'react'

const RegionsContext = createContext<string[]>([])

export function RegionsProvider({ regions, children }: { regions: string[]; children: React.ReactNode }) {
    return <RegionsContext.Provider value={regions}>{children}</RegionsContext.Provider>
}

export function useRegions() {
    return useContext(RegionsContext)
}
