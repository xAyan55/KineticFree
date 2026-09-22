// ============================================================
// KineticHost — Mock API Handlers (Development Only)
// ============================================================

import type {
  AuthUser, Server, ServerResources, Node, Allocation, Egg,
  Backup, Schedule, Database, AuditEvent, User, AdminSettings,
  FileEntry, StartupConfiguration, ServerSubuser, ApiKey, Session,
  PaginatedResponse, PaginationParams, ConsoleMessage, ServerCreateData,
  LoginCredentials, RegisterCredentials, ScheduleCreateData, ScheduleTaskCreateData,
  BackupStatus, ServerStatus,
} from "@/lib/types"
import {
  mockUsers, mockServers, mockNodes, mockAllocations, mockEggs,
  mockBackups, mockDatabases, mockSchedules, mockServerResources,
  mockFileSystem, mockFileContent, mockStartupConfigs, mockConsoleLogs,
  mockSubusers, mockApiKeys, mockSessions, mockAuditEvents, mockAdminSettings,
} from "./data"

// Simulate network delay
const delay = (ms: number = 300) => new Promise(r => setTimeout(r, ms + Math.random() * 200))

// Simple ID generator
let nextId = 100
const genId = (prefix: string) => `${prefix}_${nextId++}`

// Deep clone to avoid mutations
const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))

// Paginate helper
function paginate<T>(items: T[], params: PaginationParams = {}): PaginatedResponse<T> {
  const page = params.page || 1
  const perPage = params.perPage || 25
  let filtered = [...items]

  if (params.search) {
    const s = params.search.toLowerCase()
    filtered = filtered.filter(item =>
      JSON.stringify(item).toLowerCase().includes(s)
    )
  }

  const total = filtered.length
  const totalPages = Math.ceil(total / perPage)
  const start = (page - 1) * perPage
  const data = filtered.slice(start, start + perPage)

  return { data, page, perPage, total, totalPages }
}

// ============================================================
// Auth
// ============================================================

let currentUser: AuthUser | null = null

export const mockAuth = {
  async login(creds: LoginCredentials): Promise<AuthUser> {
    await delay(500)
    const user = mockUsers.find(u => u.email === creds.email)
    if (!user || user.status === "suspended") {
      // In dev mode, accept any email/password
      currentUser = {
        id: "usr_1",
        name: "Ayan",
        email: creds.email,
        role: creds.email.includes("admin") || creds.email === "ayan@kinetic.host" ? "admin" : "user",
        createdAt: "2026-01-15T10:00:00Z",
        emailVerified: true,
      }
    } else {
      currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
      }
    }
    return clone(currentUser)
  },

  async register(creds: RegisterCredentials): Promise<AuthUser> {
    await delay(500)
    currentUser = {
      id: genId("usr"),
      name: creds.name,
      email: creds.email,
      role: "user",
      createdAt: new Date().toISOString(),
      emailVerified: false,
    }
    return clone(currentUser)
  },

  async logout(): Promise<void> {
    await delay(200)
    currentUser = null
  },

  async getSession(): Promise<AuthUser | null> {
    await delay(200)
    return currentUser ? clone(currentUser) : null
  },

  async forgotPassword(_email: string): Promise<void> {
    await delay(500)
  },

  async resetPassword(_token: string, _password: string): Promise<void> {
    await delay(500)
  },
}

// ============================================================
// Servers
// ============================================================

export const mockServerApi = {
  async list(): Promise<Server[]> {
    await delay()
    return clone(mockServers)
  },

  async get(id: string): Promise<Server> {
    await delay()
    const server = mockServers.find(s => s.id === id)
    if (!server) throw { status: 404, code: "NOT_FOUND", message: "Server not found" }
    return clone(server)
  },

  async create(data: ServerCreateData): Promise<Server> {
    await delay(1000)
    const egg = mockEggs.find(e => e.id === data.eggId)
    const node = data.nodeId ? mockNodes.find(n => n.id === data.nodeId) : mockNodes[0]
    const alloc = mockAllocations.find(a => !a.assigned) || mockAllocations[0]

    const server: Server = {
      id: genId("srv"),
      uuid: crypto.randomUUID(),
      name: data.name,
      description: data.description || "",
      status: "installing",
      ownerId: currentUser?.id || "usr_1",
      ownerName: currentUser?.name || "Unknown",
      ownerEmail: currentUser?.email || "",
      nodeId: node?.id || "node_1",
      nodeName: node?.name || "Unknown",
      eggId: data.eggId,
      eggName: egg?.name || "Unknown",
      softwareName: egg?.name || "Unknown",
      softwareVersion: data.environment?.MINECRAFT_VERSION || "latest",
      allocation: { ...alloc, assigned: true, serverId: "new", primary: true },
      additionalAllocations: [],
      limits: data.limits,
      featureLimits: data.featureLimits,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      installedAt: null,
      suspendedAt: null,
    }
    mockServers.push(server)
    return clone(server)
  },

  async update(id: string, data: Partial<Server>): Promise<Server> {
    await delay()
    const idx = mockServers.findIndex(s => s.id === id)
    if (idx === -1) throw { status: 404, code: "NOT_FOUND", message: "Server not found" }
    Object.assign(mockServers[idx], data, { updatedAt: new Date().toISOString() })
    return clone(mockServers[idx])
  },

  async delete(id: string): Promise<void> {
    await delay(500)
    const idx = mockServers.findIndex(s => s.id === id)
    if (idx !== -1) mockServers.splice(idx, 1)
  },

  async getResources(id: string): Promise<ServerResources> {
    await delay(100)
    const resources = mockServerResources[id]
    if (!resources) {
      return { cpuUsage: 0, memoryUsage: 0, memoryLimit: 0, diskUsage: 0, diskLimit: 0, networkRx: 0, networkTx: 0, uptime: 0, state: "offline" }
    }
    // Add small random variation for realism
    return {
      ...resources,
      cpuUsage: Math.max(0, resources.cpuUsage + (Math.random() - 0.5) * 10),
      memoryUsage: Math.max(0, resources.memoryUsage + (Math.random() - 0.5) * 100000000),
    }
  },

  async sendPowerAction(id: string, action: string): Promise<void> {
    await delay(500)
    const server = mockServers.find(s => s.id === id)
    if (!server) throw { status: 404, code: "NOT_FOUND", message: "Server not found" }

    const stateMap: Record<string, ServerStatus> = {
      start: "starting",
      stop: "stopping",
      restart: "restarting",
      kill: "offline",
    }
    server.status = stateMap[action] || server.status

    // Simulate state transition
    if (action === "start") {
      setTimeout(() => { server.status = "running" }, 3000)
    } else if (action === "stop" || action === "restart") {
      setTimeout(() => {
        server.status = action === "restart" ? "starting" : "offline"
        if (action === "restart") {
          setTimeout(() => { server.status = "running" }, 2000)
        }
      }, 2000)
    }
  },

  async sendCommand(_id: string, _command: string): Promise<void> {
    await delay(100)
  },

  async getConsoleHistory(id: string): Promise<ConsoleMessage[]> {
    await delay()
    return clone(mockConsoleLogs)
  },
}

// ============================================================
// Files
// ============================================================

export const mockFileApi = {
  async list(serverId: string, path: string): Promise<FileEntry[]> {
    await delay()
    const normalizedPath = path === "" ? "/" : path
    return clone(mockFileSystem[serverId]?.[normalizedPath] || [])
  },

  async getContent(serverId: string, path: string): Promise<string> {
    await delay()
    return mockFileContent[`${serverId}:${path}`] || "# File content not available in mock mode"
  },

  async saveContent(_serverId: string, path: string, content: string): Promise<void> {
    await delay()
    mockFileContent[`${_serverId}:${path}`] = content
  },

  async createFile(_serverId: string, _path: string): Promise<void> {
    await delay()
  },

  async createDirectory(_serverId: string, _path: string): Promise<void> {
    await delay()
  },

  async deleteFile(_serverId: string, _path: string): Promise<void> {
    await delay()
  },

  async rename(_serverId: string, _from: string, _to: string): Promise<void> {
    await delay()
  },
}

// ============================================================
// Backups
// ============================================================

export const mockBackupApi = {
  async list(serverId: string): Promise<Backup[]> {
    await delay()
    return clone(mockBackups[serverId] || [])
  },

  async create(serverId: string, name: string): Promise<Backup> {
    await delay(500)
    const backup: Backup = {
      id: genId("bak"),
      serverId,
      name,
      size: 0,
      checksum: null,
      status: "creating" as BackupStatus,
      createdAt: new Date().toISOString(),
      completedAt: null,
    }
    if (!mockBackups[serverId]) mockBackups[serverId] = []
    mockBackups[serverId].push(backup)

    // Simulate completion
    setTimeout(() => {
      backup.status = "completed"
      backup.size = Math.floor(Math.random() * 500000000) + 100000000
      backup.completedAt = new Date().toISOString()
      backup.checksum = `sha256:${Math.random().toString(36).slice(2)}`
    }, 5000)

    return clone(backup)
  },

  async delete(serverId: string, backupId: string): Promise<void> {
    await delay()
    const backups = mockBackups[serverId]
    if (backups) {
      const idx = backups.findIndex(b => b.id === backupId)
      if (idx !== -1) backups.splice(idx, 1)
    }
  },

  async restore(_serverId: string, _backupId: string): Promise<void> {
    await delay(1000)
  },
}

// ============================================================
// Databases
// ============================================================

export const mockDatabaseApi = {
  async list(serverId: string): Promise<Database[]> {
    await delay()
    return clone(mockDatabases[serverId] || [])
  },

  async create(serverId: string, name: string): Promise<Database> {
    await delay(500)
    const db: Database = {
      id: genId("db"),
      serverId,
      name: `s${serverId.slice(-1)}_${name}`,
      username: `u${serverId.slice(-1)}_${name}`,
      host: "db.kinetic.host",
      port: 3306,
      maxConnections: 10,
      status: "active",
      createdAt: new Date().toISOString(),
      password: `kh_${Math.random().toString(36).slice(2, 14)}`,
    }
    if (!mockDatabases[serverId]) mockDatabases[serverId] = []
    mockDatabases[serverId].push(db)
    return clone(db)
  },

  async delete(serverId: string, dbId: string): Promise<void> {
    await delay()
    const dbs = mockDatabases[serverId]
    if (dbs) {
      const idx = dbs.findIndex(d => d.id === dbId)
      if (idx !== -1) dbs.splice(idx, 1)
    }
  },

  async resetPassword(_serverId: string, _dbId: string): Promise<{ password: string }> {
    await delay()
    return { password: `kh_${Math.random().toString(36).slice(2, 14)}` }
  },
}

// ============================================================
// Schedules
// ============================================================

export const mockScheduleApi = {
  async list(serverId: string): Promise<Schedule[]> {
    await delay()
    return clone(mockSchedules[serverId] || [])
  },

  async create(serverId: string, data: ScheduleCreateData): Promise<Schedule> {
    await delay()
    const schedule: Schedule = {
      id: genId("sched"),
      serverId,
      ...data,
      lastRunAt: null,
      nextRunAt: null,
      tasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    if (!mockSchedules[serverId]) mockSchedules[serverId] = []
    mockSchedules[serverId].push(schedule)
    return clone(schedule)
  },

  async update(serverId: string, scheduleId: string, data: Partial<ScheduleCreateData>): Promise<Schedule> {
    await delay()
    const schedules = mockSchedules[serverId] || []
    const schedule = schedules.find(s => s.id === scheduleId)
    if (!schedule) throw { status: 404, code: "NOT_FOUND", message: "Schedule not found" }
    Object.assign(schedule, data, { updatedAt: new Date().toISOString() })
    return clone(schedule)
  },

  async delete(serverId: string, scheduleId: string): Promise<void> {
    await delay()
    const schedules = mockSchedules[serverId]
    if (schedules) {
      const idx = schedules.findIndex(s => s.id === scheduleId)
      if (idx !== -1) schedules.splice(idx, 1)
    }
  },

  async createTask(serverId: string, scheduleId: string, data: ScheduleTaskCreateData): Promise<void> {
    await delay()
    const schedules = mockSchedules[serverId] || []
    const schedule = schedules.find(s => s.id === scheduleId)
    if (schedule) {
      schedule.tasks.push({
        id: genId("task"),
        scheduleId,
        sequenceId: schedule.tasks.length + 1,
        ...data,
      })
    }
  },

  async deleteTask(serverId: string, scheduleId: string, taskId: string): Promise<void> {
    await delay()
    const schedules = mockSchedules[serverId] || []
    const schedule = schedules.find(s => s.id === scheduleId)
    if (schedule) {
      schedule.tasks = schedule.tasks.filter(t => t.id !== taskId)
    }
  },
}

// ============================================================
// Nodes
// ============================================================

export const mockNodeApi = {
  async list(): Promise<Node[]> {
    await delay()
    return clone(mockNodes)
  },

  async get(id: string): Promise<Node> {
    await delay()
    const node = mockNodes.find(n => n.id === id)
    if (!node) throw { status: 404, code: "NOT_FOUND", message: "Node not found" }
    return clone(node)
  },

  async create(data: Partial<Node>): Promise<Node> {
    await delay()
    const node: Node = {
      id: genId("node"),
      name: data.name || "New Node",
      description: data.description || "",
      locationId: data.locationId || "loc_1",
      location: data.location || "Unknown",
      fqdn: data.fqdn || "new.kinetic.host",
      scheme: data.scheme || "https",
      status: "online",
      memory: data.memory || 65536,
      memoryAllocated: 0,
      memoryOverallocate: 0,
      disk: data.disk || 512000,
      diskAllocated: 0,
      diskOverallocate: 0,
      daemonPort: 8080,
      daemonSftp: 2022,
      serverCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockNodes.push(node)
    return clone(node)
  },

  async update(id: string, data: Partial<Node>): Promise<Node> {
    await delay()
    const idx = mockNodes.findIndex(n => n.id === id)
    if (idx === -1) throw { status: 404, code: "NOT_FOUND", message: "Node not found" }
    Object.assign(mockNodes[idx], data, { updatedAt: new Date().toISOString() })
    return clone(mockNodes[idx])
  },

  async delete(id: string): Promise<void> {
    await delay()
    const idx = mockNodes.findIndex(n => n.id === id)
    if (idx !== -1) mockNodes.splice(idx, 1)
  },
}

// ============================================================
// Allocations
// ============================================================

export const mockAllocationApi = {
  async list(params?: PaginationParams): Promise<PaginatedResponse<Allocation>> {
    await delay()
    return paginate(mockAllocations, params)
  },

  async create(data: Partial<Allocation>): Promise<Allocation> {
    await delay()
    const alloc: Allocation = {
      id: genId("alloc"),
      ip: data.ip || "0.0.0.0",
      port: data.port || 25565,
      alias: data.alias || null,
      serverId: null,
      serverName: null,
      nodeId: data.nodeId || "node_1",
      nodeName: mockNodes.find(n => n.id === data.nodeId)?.name || "Unknown",
      primary: false,
      assigned: false,
    }
    mockAllocations.push(alloc)
    return clone(alloc)
  },

  async delete(id: string): Promise<void> {
    await delay()
    const idx = mockAllocations.findIndex(a => a.id === id)
    if (idx !== -1) mockAllocations.splice(idx, 1)
  },
}

// ============================================================
// Eggs
// ============================================================

export const mockEggApi = {
  async list(): Promise<Egg[]> {
    await delay()
    return clone(mockEggs)
  },

  async get(id: string): Promise<Egg> {
    await delay()
    const egg = mockEggs.find(e => e.id === id)
    if (!egg) throw { status: 404, code: "NOT_FOUND", message: "Egg not found" }
    return clone(egg)
  },

  async create(data: Partial<Egg>): Promise<Egg> {
    await delay()
    const egg: Egg = {
      id: genId("egg"),
      name: data.name || "New Egg",
      description: data.description || "",
      dockerImage: data.dockerImage || "",
      startupCommand: data.startupCommand || "",
      variables: data.variables || [],
      installScript: data.installScript || "",
      stopCommand: data.stopCommand || "stop",
      supportedVersions: data.supportedVersions || [],
      category: data.category || "Minecraft",
      author: "KineticHost",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockEggs.push(egg)
    return clone(egg)
  },

  async update(id: string, data: Partial<Egg>): Promise<Egg> {
    await delay()
    const idx = mockEggs.findIndex(e => e.id === id)
    if (idx === -1) throw { status: 404, code: "NOT_FOUND", message: "Egg not found" }
    Object.assign(mockEggs[idx], data, { updatedAt: new Date().toISOString() })
    return clone(mockEggs[idx])
  },

  async delete(id: string): Promise<void> {
    await delay()
    const idx = mockEggs.findIndex(e => e.id === id)
    if (idx !== -1) mockEggs.splice(idx, 1)
  },
}

// ============================================================
// Users (admin)
// ============================================================

export const mockUserApi = {
  async list(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    await delay()
    return paginate(mockUsers, params)
  },

  async get(id: string): Promise<User> {
    await delay()
    const user = mockUsers.find(u => u.id === id)
    if (!user) throw { status: 404, code: "NOT_FOUND", message: "User not found" }
    return clone(user)
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    await delay()
    const idx = mockUsers.findIndex(u => u.id === id)
    if (idx === -1) throw { status: 404, code: "NOT_FOUND", message: "User not found" }
    Object.assign(mockUsers[idx], data, { updatedAt: new Date().toISOString() })
    return clone(mockUsers[idx])
  },

  async suspend(id: string): Promise<void> {
    await delay()
    const user = mockUsers.find(u => u.id === id)
    if (user) user.status = "suspended"
  },

  async unsuspend(id: string): Promise<void> {
    await delay()
    const user = mockUsers.find(u => u.id === id)
    if (user) user.status = "active"
  },

  async delete(id: string): Promise<void> {
    await delay()
    const idx = mockUsers.findIndex(u => u.id === id)
    if (idx !== -1) mockUsers.splice(idx, 1)
  },
}

// ============================================================
// Account
// ============================================================

export const mockAccountApi = {
  async updateProfile(data: { name?: string; email?: string }): Promise<AuthUser> {
    await delay()
    if (currentUser) {
      if (data.name) currentUser.name = data.name
      if (data.email) currentUser.email = data.email
    }
    return clone(currentUser!)
  },

  async changePassword(_current: string, _newPassword: string): Promise<void> {
    await delay(500)
  },

  async getSessions(): Promise<Session[]> {
    await delay()
    return clone(mockSessions)
  },

  async revokeSession(_id: string): Promise<void> {
    await delay()
  },

  async revokeAllSessions(): Promise<void> {
    await delay()
  },

  async getApiKeys(): Promise<ApiKey[]> {
    await delay()
    return clone(mockApiKeys)
  },

  async createApiKey(description: string): Promise<ApiKey> {
    await delay()
    const key: ApiKey = {
      id: genId("key"),
      identifier: `kh_${Math.random().toString(36).slice(2, 8)}`,
      description,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      secret: `kh_secret_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
    }
    mockApiKeys.push(key)
    return clone(key)
  },

  async revokeApiKey(id: string): Promise<void> {
    await delay()
    const idx = mockApiKeys.findIndex(k => k.id === id)
    if (idx !== -1) mockApiKeys.splice(idx, 1)
  },
}

// ============================================================
// Startup
// ============================================================

export const mockStartupApi = {
  async get(serverId: string): Promise<StartupConfiguration> {
    await delay()
    return clone(mockStartupConfigs[serverId] || { startup: "", dockerImage: "", environment: {}, variables: [] })
  },

  async update(serverId: string, data: Partial<StartupConfiguration>): Promise<StartupConfiguration> {
    await delay()
    if (mockStartupConfigs[serverId]) {
      Object.assign(mockStartupConfigs[serverId], data)
    }
    return clone(mockStartupConfigs[serverId])
  },
}

// ============================================================
// Subusers
// ============================================================

export const mockSubuserApi = {
  async list(serverId: string): Promise<ServerSubuser[]> {
    await delay()
    return clone(mockSubusers[serverId] || [])
  },

  async create(serverId: string, email: string, permissions: string[]): Promise<ServerSubuser> {
    await delay()
    const subuser: ServerSubuser = {
      id: genId("su"),
      userId: genId("usr"),
      userName: email.split("@")[0],
      userEmail: email,
      permissions: permissions as any,
      createdAt: new Date().toISOString(),
    }
    if (!mockSubusers[serverId]) mockSubusers[serverId] = []
    mockSubusers[serverId].push(subuser)
    return clone(subuser)
  },

  async delete(serverId: string, subuserId: string): Promise<void> {
    await delay()
    const subs = mockSubusers[serverId]
    if (subs) {
      const idx = subs.findIndex(s => s.id === subuserId)
      if (idx !== -1) subs.splice(idx, 1)
    }
  },
}

// ============================================================
// Admin
// ============================================================

export const mockAdminApi = {
  async getSettings(): Promise<AdminSettings> {
    await delay()
    return clone(mockAdminSettings)
  },

  async updateSettings(data: Partial<AdminSettings>): Promise<AdminSettings> {
    await delay()
    Object.assign(mockAdminSettings, data)
    return clone(mockAdminSettings)
  },

  async getAuditLog(params?: PaginationParams): Promise<PaginatedResponse<AuditEvent>> {
    await delay()
    return paginate(mockAuditEvents, params)
  },

  async getOverviewStats(): Promise<{
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
  }> {
    await delay()
    return {
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.filter(u => u.status === "active").length,
      totalServers: mockServers.length,
      runningServers: mockServers.filter(s => s.status === "running").length,
      totalNodes: mockNodes.length,
      onlineNodes: mockNodes.filter(n => n.status === "online").length,
      allocatedMemory: mockNodes.reduce((sum, n) => sum + n.memoryAllocated, 0),
      totalMemory: mockNodes.reduce((sum, n) => sum + n.memory, 0),
      allocatedDisk: mockNodes.reduce((sum, n) => sum + n.diskAllocated, 0),
      totalDisk: mockNodes.reduce((sum, n) => sum + n.disk, 0),
    }
  },

  async getServersByAdmin(params?: PaginationParams): Promise<PaginatedResponse<Server>> {
    await delay()
    return paginate(mockServers, params)
  },

  async suspendServer(id: string): Promise<void> {
    await delay()
    const server = mockServers.find(s => s.id === id)
    if (server) {
      server.status = "suspended"
      server.suspendedAt = new Date().toISOString()
    }
  },

  async unsuspendServer(id: string): Promise<void> {
    await delay()
    const server = mockServers.find(s => s.id === id)
    if (server) {
      server.status = "offline"
      server.suspendedAt = null
    }
  },
}
