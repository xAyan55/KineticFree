// ============================================================
// KineticHost — User API Service (Real Backend / Admin)
// ============================================================

import type { User, PaginatedResponse, PaginationParams } from "@/lib/types"
import { apiClient } from "./client"

export const userApi = {
  /**
   * List all users (admin only) with pagination.
   */
  async list(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return apiClient.get<PaginatedResponse<User>>("/admin/users", {
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
   * Get a single user by ID (admin only).
   */
  async get(id: string): Promise<User> {
    return apiClient.get<User>(`/admin/users/${id}`)
  },

  /**
   * Update a user (admin only).
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    return apiClient.patch<User>(`/admin/users/${id}`, data)
  },

  /**
   * Suspend a user (admin only).
   */
  async suspend(id: string): Promise<void> {
    await apiClient.post<void>(`/admin/users/${id}/suspend`)
  },

  /**
   * Unsuspend a user (admin only).
   */
  async unsuspend(id: string): Promise<void> {
    await apiClient.post<void>(`/admin/users/${id}/unsuspend`)
  },

  /**
   * Delete a user (admin only).
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`)
  },
}
