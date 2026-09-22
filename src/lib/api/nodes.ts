// ============================================================
// KineticHost — Node API Service (Real Backend)
// ============================================================

import type { Node } from "@/lib/types"
import { apiClient } from "./client"

export const nodeApi = {
  /**
   * List all cluster nodes.
   */
  async list(): Promise<Node[]> {
    return apiClient.get<Node[]>("/admin/nodes")
  },

  /**
   * Get a single node by ID.
   */
  async get(id: string): Promise<Node> {
    return apiClient.get<Node>(`/admin/nodes/${id}`)
  },

  /**
   * Create a new node.
   */
  async create(data: Partial<Node>): Promise<Node> {
    return apiClient.post<Node>("/admin/nodes", data)
  },

  /**
   * Update a node.
   */
  async update(id: string, data: Partial<Node>): Promise<Node> {
    return apiClient.patch<Node>(`/admin/nodes/${id}`, data)
  },

  /**
   * Delete a node.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/nodes/${id}`)
  },
}
