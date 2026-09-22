// ============================================================
// KineticHost — Subuser API Service (Real Backend)
// ============================================================

import type { ServerSubuser, ServerPermission } from "@/lib/types"
import { apiClient } from "./client"

export const subuserApi = {
  /**
   * List all subusers for a server.
   */
  async list(serverId: string): Promise<ServerSubuser[]> {
    return apiClient.get<ServerSubuser[]>(`/servers/${serverId}/subusers`)
  },

  /**
   * Add a subuser to a server by email.
   */
  async create(serverId: string, email: string, permissions: ServerPermission[]): Promise<ServerSubuser> {
    return apiClient.post<ServerSubuser>(`/servers/${serverId}/subusers`, {
      email,
      permissions,
    })
  },

  /**
   * Update a subuser's permissions.
   */
  async update(serverId: string, subuserId: string, permissions: ServerPermission[]): Promise<ServerSubuser> {
    return apiClient.patch<ServerSubuser>(
      `/servers/${serverId}/subusers/${subuserId}`,
      { permissions }
    )
  },

  /**
   * Remove a subuser from a server.
   */
  async delete(serverId: string, subuserId: string): Promise<void> {
    await apiClient.delete(`/servers/${serverId}/subusers/${subuserId}`)
  },
}
