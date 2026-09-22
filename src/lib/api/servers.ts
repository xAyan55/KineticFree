// ============================================================
// KineticHost — Server API Service (Real Backend)
// ============================================================

import type {
  Server, ServerResources, ServerCreateData, ConsoleMessage,
  PowerAction,
} from "@/lib/types"
import { apiClient } from "./client"

export const serverApi = {
  /**
   * List all servers accessible by the current user.
   */
  async list(): Promise<Server[]> {
    const response = await apiClient.get<{ data: Server[] }>("/servers")
    return response.data
  },

  /**
   * Get a single server by ID.
   */
  async get(id: string): Promise<Server> {
    return apiClient.get<Server>(`/servers/${id}`)
  },

  /**
   * Create a new server.
   * Returns the server in "installing" status with an operationId.
   */
  async create(data: ServerCreateData): Promise<Server> {
    return apiClient.post<Server>("/servers", data)
  },

  /**
   * Update server details (name, description).
   */
  async update(id: string, data: Partial<Pick<Server, "name" | "description">>): Promise<Server> {
    return apiClient.patch<Server>(`/servers/${id}`, data)
  },

  /**
   * Delete a server permanently.
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/servers/${id}`)
  },

  /**
   * Get real-time resource usage from the daemon.
   * Returns telemetry only when the server container is running.
   */
  async getResources(id: string): Promise<ServerResources> {
    return apiClient.get<ServerResources>(`/servers/${id}/resources`)
  },

  /**
   * Send a power action to the server container.
   * Backend validates permissions and queues the action with the daemon.
   */
  async sendPowerAction(id: string, action: PowerAction): Promise<{ accepted: boolean; operationId: string; status: string }> {
    return apiClient.post<{ accepted: boolean; operationId: string; status: string }>(
      `/servers/${id}/power`,
      { action }
    )
  },

  /**
   * Send a console command to the running server.
   * Output will appear in the console stream — never fabricated locally.
   */
  async sendCommand(id: string, command: string): Promise<{ accepted: boolean }> {
    return apiClient.post<{ accepted: boolean }>(`/servers/${id}/command`, { command })
  },

  /**
   * Fetch recent console log backlog before connecting WebSocket.
   */
  async getConsoleHistory(id: string): Promise<ConsoleMessage[]> {
    return apiClient.get<ConsoleMessage[]>(`/servers/${id}/logs`)
  },

  /**
   * Trigger server reinstallation.
   */
  async reinstall(id: string): Promise<{ accepted: boolean; operationId: string; status: string }> {
    return apiClient.post<{ accepted: boolean; operationId: string; status: string }>(
      `/servers/${id}/reinstall`
    )
  },
}
