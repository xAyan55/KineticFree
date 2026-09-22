// ============================================================
// KineticHost — Account API Service (Real Backend)
// ============================================================

import type { AuthUser, Session, ApiKey } from "@/lib/types"
import { apiClient } from "./client"

export const accountApi = {
  /**
   * Update the current user's profile.
   */
  async updateProfile(data: { name?: string; email?: string }): Promise<AuthUser> {
    return apiClient.patch<AuthUser>("/account/profile", data)
  },

  /**
   * Change the current user's password.
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post<void>("/account/password", {
      currentPassword,
      newPassword,
    })
  },

  /**
   * List active sessions for the current user.
   */
  async getSessions(): Promise<Session[]> {
    return apiClient.get<Session[]>("/account/sessions")
  },

  /**
   * Revoke a specific session.
   */
  async revokeSession(id: string): Promise<void> {
    await apiClient.delete(`/account/sessions/${id}`)
  },

  /**
   * Revoke all sessions except the current one.
   */
  async revokeAllSessions(): Promise<void> {
    await apiClient.post<void>("/account/sessions/revoke-all")
  },

  /**
   * List all API keys for the current user.
   */
  async getApiKeys(): Promise<ApiKey[]> {
    return apiClient.get<ApiKey[]>("/account/api-keys")
  },

  /**
   * Create a new API key.
   * The secret is returned ONCE in the response and must be stored by the user.
   */
  async createApiKey(description: string): Promise<ApiKey> {
    return apiClient.post<ApiKey>("/account/api-keys", { description })
  },

  /**
   * Revoke an API key.
   */
  async revokeApiKey(id: string): Promise<void> {
    await apiClient.delete(`/account/api-keys/${id}`)
  },

  /**
   * Enable 2FA — returns TOTP secret and QR code URI.
   */
  async enable2FA(): Promise<{ secret: string; qrUri: string }> {
    return apiClient.post<{ secret: string; qrUri: string }>("/account/2fa/enable")
  },

  /**
   * Confirm 2FA setup with a TOTP code.
   */
  async confirm2FA(code: string): Promise<{ recoveryCodes: string[] }> {
    return apiClient.post<{ recoveryCodes: string[] }>("/account/2fa/confirm", { code })
  },

  /**
   * Disable 2FA with password confirmation.
   */
  async disable2FA(password: string): Promise<void> {
    await apiClient.post<void>("/account/2fa/disable", { password })
  },
}
