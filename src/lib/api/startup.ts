// ============================================================
// KineticHost — Startup API Service (Real Backend)
// ============================================================

import type { StartupConfiguration } from "@/lib/types"
import { apiClient } from "./client"

export const startupApi = {
  /**
   * Get the startup configuration for a server.
   */
  async get(serverId: string): Promise<StartupConfiguration> {
    return apiClient.get<StartupConfiguration>(`/servers/${serverId}/startup`)
  },

  /**
   * Update the startup configuration for a server.
   */
  async update(serverId: string, data: Partial<StartupConfiguration>): Promise<StartupConfiguration> {
    return apiClient.patch<StartupConfiguration>(`/servers/${serverId}/startup`, data)
  },
}
