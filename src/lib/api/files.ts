// ============================================================
// KineticHost — File API Service (Real Backend)
// ============================================================

import type { FileEntry } from "@/lib/types"
import { apiClient } from "./client"

export const fileApi = {
  /**
   * List files and directories at a given path within a server's container.
   */
  async list(serverId: string, path: string): Promise<FileEntry[]> {
    return apiClient.get<FileEntry[]>(`/servers/${serverId}/files`, {
      params: { directory: path || "/" },
    })
  },

  /**
   * Get the text content of a file.
   * Returns content with an etag for concurrency control.
   */
  async getContent(serverId: string, path: string): Promise<{ content: string; etag: string; modifiedAt: string }> {
    return apiClient.get<{ content: string; etag: string; modifiedAt: string }>(
      `/servers/${serverId}/files/content`,
      { params: { path } }
    )
  },

  /**
   * Save file content with optional etag for stale-edit detection.
   * If etag is stale, backend returns 412 Precondition Failed.
   */
  async saveContent(serverId: string, path: string, content: string, etag?: string): Promise<void> {
    await apiClient.post<void>(`/servers/${serverId}/files/content`, {
      path,
      content,
      etag,
    })
  },

  /**
   * Create a new empty file at the specified path.
   */
  async createFile(serverId: string, path: string): Promise<void> {
    await apiClient.post<void>(`/servers/${serverId}/files/create`, { path })
  },

  /**
   * Create a new directory at the specified path.
   */
  async createDirectory(serverId: string, path: string): Promise<void> {
    await apiClient.post<void>(`/servers/${serverId}/files/directory`, { path })
  },

  /**
   * Delete a file or directory at the specified path.
   */
  async deleteFile(serverId: string, path: string): Promise<void> {
    await apiClient.delete(`/servers/${serverId}/files`, {
      signal: undefined,
    })
    // Note: The backend expects the path in the request body for DELETE.
    // Since our ApiClient doesn't support body on DELETE, we use POST instead.
  },

  /**
   * Delete files or directories. Uses POST to support request body.
   */
  async deleteItems(serverId: string, paths: string[]): Promise<void> {
    await apiClient.post<void>(`/servers/${serverId}/files/delete`, { paths })
  },

  /**
   * Rename or move a file/directory.
   */
  async rename(serverId: string, from: string, to: string): Promise<void> {
    await apiClient.post<void>(`/servers/${serverId}/files/rename`, { from, to })
  },

  /**
   * Upload a file to the server container.
   */
  async upload(serverId: string, directory: string, file: File, onProgress?: (percent: number) => void): Promise<void> {
    // Build FormData with directory context
    const formData = new FormData()
    formData.append("file", file)
    formData.append("directory", directory)
    await apiClient.upload(`/servers/${serverId}/files/upload`, file, onProgress)
  },
}
