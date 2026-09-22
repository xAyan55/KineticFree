// ============================================================
// KineticHost — Allocation API Service (Real Backend)
// ============================================================

import type { Allocation, PaginatedResponse, PaginationParams } from "@/lib/types"
import { apiClient } from "./client"

export const allocationApi = {
  /**
   * List allocations with pagination.
   */
  async list(params?: PaginationParams): Promise<PaginatedResponse<Allocation>> {
    return apiClient.get<PaginatedResponse<Allocation>>("/admin/allocations", {
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
   * Create a new allocation.
   */
  async create(data: Partial<Allocation>): Promise<Allocation> {
    return apiClient.post<Allocation>("/admin/allocations", data)
  },

  /**
   * Delete an allocation.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/allocations/${id}`)
  },
}
