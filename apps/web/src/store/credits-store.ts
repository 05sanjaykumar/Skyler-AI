// apps/web/src/store/credits-store.ts
import { create } from "zustand"
import { getCredits, checkCredits, CreditResult } from "@/lib/credits"

interface CreditsState {
  credits: number
  expirationDate?: string
  loading: boolean
  error?: string
  fetchCredits: (token: string) => Promise<void>
  deductCredits: (token: string, cost: number) => Promise<boolean>
}

export const useCreditsStore = create<CreditsState>((set) => ({
  credits: 0,
  expirationDate: undefined,
  loading: false,
  error: undefined,

  fetchCredits: async (token) => {
    set({ loading: true, error: undefined })
    const result: CreditResult = await getCredits(token)
    if (result.ok) {
      set({
        credits: result.creditsRemaining ?? 0,
        expirationDate: result.planExpirationDate,
        loading: false,
      })
    } else {
      set({ error: result.error, loading: false })
    }
  },

  deductCredits: async (token, cost) => {
    set({ loading: true, error: undefined })
    const result: CreditResult = await checkCredits(token, cost)
    if (result.ok) {
      set({
        credits: result.creditsRemaining ?? 0,
        expirationDate: result.planExpirationDate,
        loading: false,
      })
      return true
    } else {
      set({ error: result.error, loading: false })
      return false
    }
  },
}))
