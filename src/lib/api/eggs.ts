// ============================================================
// KineticHost — Egg API Service (Real Backend)
// ============================================================

import type { Egg } from "@/lib/types"
import { apiClient } from "./client"

export const eggApi = {
  /**
   * List all available eggs (server software templates).
   */
  async list(): Promise<Egg[]> {
    return apiClient.get<Egg[]>("/admin/eggs")
  },

  /**
   * Get a single egg by ID.
   */
  async get(id: string): Promise<Egg> {
    return apiClient.get<Egg>(`/admin/eggs/${id}`)
  },

  /**
   * Create a new egg.
   */
  async create(data: Partial<Egg>): Promise<Egg> {
    return apiClient.post<Egg>("/admin/eggs", data)
  },

  /**
   * Update an egg.
   */
  async update(id: string, data: Partial<Egg>): Promise<Egg> {
    return apiClient.patch<Egg>(`/admin/eggs/${id}`, data)
  },

  /**
   * Delete an egg.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/eggs/${id}`)
  },
}
