// ============================================================
// KineticHost — API Client
// ============================================================

import type { ApiError } from "@/lib/types"

const BASE_URL = import.meta.env.VITE_API_URL || "/api"

class ApiClient {
  private baseUrl: string
  private abortControllers = new Map<string, AbortController>()

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown
      params?: Record<string, string | number | undefined>
      signal?: AbortSignal
      requestId?: string
      headers?: Record<string, string>
      rawResponse?: boolean
    } = {}
  ): Promise<T> {
    const { body, params, signal, requestId, headers: extraHeaders } = options

    // Cancel previous request with same ID
    if (requestId) {
      this.abortControllers.get(requestId)?.abort()
      const controller = new AbortController()
      this.abortControllers.set(requestId, controller)
    }

    const url = new URL(`${this.baseUrl}${path}`, window.location.origin)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value))
        }
      })
    }

    const headers: Record<string, string> = {
      "Accept": "application/json",
      ...extraHeaders,
    }

    if (body && !(body instanceof FormData)) {
      headers["Content-Type"] = "application/json"
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      signal: signal || (requestId ? this.abortControllers.get(requestId)?.signal : undefined),
      credentials: "include",
    })

    if (requestId) {
      this.abortControllers.delete(requestId)
    }

    if (!response.ok) {
      let error: ApiError
      try {
        const errorData = await response.json()
        error = {
          status: response.status,
          code: errorData.code || `HTTP_${response.status}`,
          message: errorData.message || response.statusText,
          errors: errorData.errors,
        }
      } catch {
        error = {
          status: response.status,
          code: `HTTP_${response.status}`,
          message: response.statusText,
        }
      }
      throw error
    }

    if (response.status === 204) {
      return undefined as T
    }

    if (options.rawResponse) {
      return response as unknown as T
    }

    return response.json()
  }

  get<T>(path: string, options?: { params?: Record<string, string | number | undefined>; signal?: AbortSignal; requestId?: string }) {
    return this.request<T>("GET", path, options)
  }

  post<T>(path: string, body?: unknown, options?: { signal?: AbortSignal; requestId?: string; headers?: Record<string, string> }) {
    return this.request<T>("POST", path, { body, ...options })
  }

  put<T>(path: string, body?: unknown, options?: { signal?: AbortSignal }) {
    return this.request<T>("PUT", path, { body, ...options })
  }

  patch<T>(path: string, body?: unknown, options?: { signal?: AbortSignal }) {
    return this.request<T>("PATCH", path, { body, ...options })
  }

  delete<T = void>(path: string, options?: { signal?: AbortSignal }) {
    return this.request<T>("DELETE", path, options)
  }

  upload<T>(path: string, file: File, onProgress?: (percent: number) => void): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${this.baseUrl}${path}`)
      xhr.withCredentials = true
      xhr.setRequestHeader("Accept", "application/json")

      if (onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100))
          }
        })
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response ? JSON.parse(xhr.responseText) : undefined)
        } else {
          try {
            reject(JSON.parse(xhr.responseText))
          } catch {
            reject({ status: xhr.status, code: `HTTP_${xhr.status}`, message: xhr.statusText })
          }
        }
      }

      xhr.onerror = () => reject({ status: 0, code: "NETWORK_ERROR", message: "Network error" })

      const formData = new FormData()
      formData.append("file", file)
      xhr.send(formData)
    })
  }

  download(path: string): Promise<Response> {
    return this.request<Response>("GET", path, { rawResponse: true })
  }

  cancelRequest(requestId: string) {
    this.abortControllers.get(requestId)?.abort()
    this.abortControllers.delete(requestId)
  }
}

export const apiClient = new ApiClient(BASE_URL)
export default apiClient
