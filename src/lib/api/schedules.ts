// ============================================================
// KineticHost — Schedule API Service (Real Backend)
// ============================================================

import type { Schedule, ScheduleCreateData, ScheduleTaskCreateData } from "@/lib/types"
import { apiClient } from "./client"

export const scheduleApi = {
  /**
   * List all schedules for a server.
   */
  async list(serverId: string): Promise<Schedule[]> {
    return apiClient.get<Schedule[]>(`/servers/${serverId}/schedules`)
  },

  /**
   * Create a new schedule.
   */
  async create(serverId: string, data: ScheduleCreateData): Promise<Schedule> {
    return apiClient.post<Schedule>(`/servers/${serverId}/schedules`, data)
  },

  /**
   * Update an existing schedule.
   */
  async update(serverId: string, scheduleId: string, data: Partial<ScheduleCreateData>): Promise<Schedule> {
    return apiClient.patch<Schedule>(`/servers/${serverId}/schedules/${scheduleId}`, data)
  },

  /**
   * Delete a schedule.
   */
  async delete(serverId: string, scheduleId: string): Promise<void> {
    await apiClient.delete(`/servers/${serverId}/schedules/${scheduleId}`)
  },

  /**
   * Add a task to a schedule.
   */
  async createTask(serverId: string, scheduleId: string, data: ScheduleTaskCreateData): Promise<void> {
    await apiClient.post<void>(
      `/servers/${serverId}/schedules/${scheduleId}/tasks`,
      data
    )
  },

  /**
   * Delete a task from a schedule.
   */
  async deleteTask(serverId: string, scheduleId: string, taskId: string): Promise<void> {
    await apiClient.delete(
      `/servers/${serverId}/schedules/${scheduleId}/tasks/${taskId}`
    )
  },
}
