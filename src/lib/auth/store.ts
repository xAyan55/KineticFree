// ============================================================
// KineticHost — Auth State Store (Zustand)
// ============================================================

import { create } from "zustand"
import type { AuthUser, LoginCredentials, RegisterCredentials } from "@/lib/types"
import { auth as authApi } from "@/lib/api"

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (credentials: RegisterCredentials) => Promise<boolean>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  clearError: () => void
  setUser: (user: AuthUser | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const user = await authApi.login(credentials)
      set({ user, isLoading: false })
      return true
    } catch (err: any) {
      set({
        error: err.message || "Failed to sign in. Please check your credentials.",
        isLoading: false,
      })
      return false
    }
  },

  register: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const user = await authApi.register(credentials)
      set({ user, isLoading: false })
      return true
    } catch (err: any) {
      set({
        error: err.message || "Failed to create account. Please try again.",
        isLoading: false,
      })
      return false
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await authApi.logout()
    } finally {
      set({ user: null, isLoading: false })
    }
  },

  checkSession: async () => {
    set({ isLoading: true })
    try {
      const user = await authApi.getSession()
      set({ user: user ?? null, isInitialized: true, isLoading: false })
    } catch {
      set({ user: null, isInitialized: true, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
  setUser: (user) => set({ user }),
}))
