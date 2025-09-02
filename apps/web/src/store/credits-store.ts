// apps/web/src/store/credits-store.ts
import { create } from "zustand"
import { getCredits, checkCredits, deductCredits, CreditResult } from "@/lib/credits"

interface CreditsState {
  credits: number
  expirationDate?: string
  loading: boolean
  error?: string
  fetchCredits: (token: string) => Promise<void>
  checkCredits: (token: string, cost: number) => Promise<boolean>
  deductCredits: (token: string, cost: number) => Promise<boolean>
}

export const useCreditsStore = create<CreditsState>((set) => ({
  credits: 0,
  expirationDate: undefined,
  loading: false,
  error: undefined,

  // Fetch current credits and plan info
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

  // Only check credits, does NOT deduct
  checkCredits: async (token, cost) => {
    set({ loading: true, error: undefined })
    const result: CreditResult = await checkCredits(token, cost)
    set({ loading: false })
    if (result.ok) {
      return true
    } else {
      set({ error: result.error })
      return false
    }
  },

  // Only deduct credits, assumes check already passed
  deductCredits: async (token, cost) => {
    set({ loading: true, error: undefined })
    const result: CreditResult = await deductCredits(token, cost)
    set({ loading: false })
    if (result.ok) {
      set({
        credits: result.creditsRemaining ?? 0,
        expirationDate: result.planExpirationDate,
      })
      return true
    } else {
      set({ error: result.error })
      return false
    }
  },
}))
