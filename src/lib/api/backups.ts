// ============================================================
// KineticHost — Backup API Service (Real Backend)
// ============================================================

import type { Backup } from "@/lib/types"
import { apiClient } from "./client"

export const backupApi = {
  /**
   * List all backups for a server.
   */
  async list(serverId: string): Promise<Backup[]> {
    return apiClient.get<Backup[]>(`/servers/${serverId}/backups`)
  },

  /**
   * Create a new backup.
   * Returns the backup in "queued" or "creating" status.
   * Actual completion is reflected on subsequent list calls.
   */
  async create(serverId: string, name: string): Promise<Backup> {
    return apiClient.post<Backup>(`/servers/${serverId}/backups`, { name })
  },

  /**
   * Delete a backup.
   */
  async delete(serverId: string, backupId: string): Promise<void> {
    await apiClient.delete(`/servers/${serverId}/backups/${backupId}`)
  },

  /**
   * Get a signed, time-limited download URL for a backup archive.
   */
  async getDownloadUrl(serverId: string, backupId: string): Promise<{ downloadUrl: string; expiresAt: string }> {
    return apiClient.get<{ downloadUrl: string; expiresAt: string }>(
      `/servers/${serverId}/backups/${backupId}/download`
    )
  },

  /**
   * Restore a server from a backup.
   * Returns an operationId for tracking the async restore job.
   */
  async restore(serverId: string, backupId: string): Promise<{ accepted: boolean; operationId: string }> {
    return apiClient.post<{ accepted: boolean; operationId: string }>(
      `/servers/${serverId}/backups/${backupId}/restore`
    )
  },
}
