// ============================================================
// KineticHost — Admin API Service (Real Backend)
// ============================================================

import type {
  AdminSettings, AuditEvent, Server, User,
  PaginatedResponse, PaginationParams,
} from "@/lib/types"
import { apiClient } from "./client"

export interface AdminOverviewStats {
  totalUsers: number
  activeUsers: number
  totalServers: number
  runningServers: number
  totalNodes: number
  onlineNodes: number
  allocatedMemory: number
  totalMemory: number
  allocatedDisk: number
  totalDisk: number
}

export const adminApi = {
  /**
   * Get platform settings.
   */
  async getSettings(): Promise<AdminSettings> {
    return apiClient.get<AdminSettings>("/admin/settings")
  },

  /**
   * Update platform settings.
   */
  async updateSettings(data: Partial<AdminSettings>): Promise<AdminSettings> {
    return apiClient.patch<AdminSettings>("/admin/settings", data)
  },

  /**
   * Get the admin audit log with pagination.
   */
  async getAuditLog(params?: PaginationParams): Promise<PaginatedResponse<AuditEvent>> {
    return apiClient.get<PaginatedResponse<AuditEvent>>("/admin/audit-logs", {
      params: {
        page: params?.page,
        perPage: params?.perPage,
        search: params?.search,
        sortBy: params?.sortBy,
        sortDir: params?.sortDir,
      },
    })
  },

  /**
   * Get real platform overview statistics.
   */
  async getOverviewStats(): Promise<AdminOverviewStats> {
    return apiClient.get<AdminOverviewStats>("/admin/stats")
  },

  /**
   * List all servers (admin view) with pagination.
   */
  async getServersByAdmin(params?: PaginationParams): Promise<PaginatedResponse<Server>> {
    return apiClient.get<PaginatedResponse<Server>>("/admin/servers", {
      params: {
        page: params?.page,
        perPage: params?.perPage,
        search: params?.search,
        sortBy: params?.sortBy,
        sortDir: params?.sortDir,
      },
    })
  },

  /**
   * Suspend a server.
   */
  async suspendServer(id: string): Promise<void> {
    await apiClient.post<void>(`/admin/servers/${id}/suspend`)
  },

  /**
   * Unsuspend a server.
   */
  async unsuspendServer(id: string): Promise<void> {
    await apiClient.post<void>(`/admin/servers/${id}/unsuspend`)
  },
}
