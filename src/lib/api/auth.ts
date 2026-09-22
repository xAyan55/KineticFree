// ============================================================
// KineticHost — Auth API Service (Real Backend)
// ============================================================

import type { AuthUser, LoginCredentials, RegisterCredentials } from "@/lib/types"
import { apiClient } from "./client"

export const authApi = {
  /**
   * Authenticate with email and password.
   * Backend sets HttpOnly session cookie on success.
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const response = await apiClient.post<{ user: AuthUser }>("/auth/login", credentials)
    return response.user
  },

  /**
   * Register a new account.
   * Backend sets HttpOnly session cookie on success.
   */
  async register(credentials: RegisterCredentials): Promise<AuthUser> {
    const response = await apiClient.post<{ user: AuthUser }>("/auth/register", credentials)
    return response.user
  },

  /**
   * Destroy the current session.
   * Backend clears the HttpOnly session cookie.
   */
  async logout(): Promise<void> {
    await apiClient.post<void>("/auth/logout")
  },

  /**
   * Validate the current session and retrieve user profile.
   * Returns null if no valid session exists.
   */
  async getSession(): Promise<AuthUser | null> {
    try {
      const response = await apiClient.get<{ user: AuthUser }>("/auth/session")
      return response.user
    } catch (err: any) {
      if (err.status === 401) {
        return null
      }
      throw err
    }
  },

  /**
   * Request a password reset email.
   */
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post<void>("/auth/forgot-password", { email })
  },

  /**
   * Reset password using a token from the reset email.
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post<void>("/auth/reset-password", { token, password })
  },
}
