// ============================================================
// KineticHost — Database API Service (Real Backend)
// ============================================================

import type { Database } from "@/lib/types"
import { apiClient } from "./client"

export const databaseApi = {
  /**
   * List all databases for a server.
   * Passwords are masked by default.
   */
  async list(serverId: string): Promise<Database[]> {
    return apiClient.get<Database[]>(`/servers/${serverId}/databases`)
  },

  /**
   * Create a new database.
   * The password is generated server-side and returned ONCE in the response.
   */
  async create(serverId: string, name: string): Promise<Database> {
    return apiClient.post<Database>(`/servers/${serverId}/databases`, { name })
  },

  /**
   * Delete a database.
   */
  async delete(serverId: string, dbId: string): Promise<void> {
    await apiClient.delete(`/servers/${serverId}/databases/${dbId}`)
  },

  /**
   * Reset a database password.
   * New password is generated server-side and returned ONCE.
   */
  async resetPassword(serverId: string, dbId: string): Promise<{ password: string }> {
    return apiClient.post<{ password: string }>(
      `/servers/${serverId}/databases/${dbId}/reset-password`
    )
  },
}
