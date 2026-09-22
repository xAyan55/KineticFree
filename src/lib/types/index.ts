// ============================================================
// KineticHost — Shared Type Definitions
// ============================================================

// --- Roles & Permissions ---

export type UserRole = "user" | "admin"

export type ServerPermission =
  | "console"
  | "control.start"
  | "control.stop"
  | "control.restart"
  | "control.kill"
  | "files.read"
  | "files.write"
  | "files.delete"
  | "files.upload"
  | "backups.read"
  | "backups.create"
  | "backups.delete"
  | "backups.restore"
  | "databases.read"
  | "databases.create"
  | "databases.delete"
  | "schedules.read"
  | "schedules.create"
  | "schedules.update"
  | "schedules.delete"
  | "network.read"
  | "network.update"
  | "startup.read"
  | "startup.update"
  | "users.read"
  | "users.create"
  | "users.update"
  | "users.delete"
  | "settings.read"
  | "settings.update"
  | "activity.read"

// --- Auth ---

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
  emailVerified: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

// --- Users ---

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: "active" | "suspended"
  avatarUrl?: string
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  emailVerified: boolean
  twoFactorEnabled: boolean
  serverCount: number
}

export interface Session {
  id: string
  ip: string
  browser: string
  os: string
  lastActive: string
  current: boolean
  createdAt: string
}

export interface ApiKey {
  id: string
  identifier: string
  description: string
  lastUsedAt: string | null
  createdAt: string
  /** Only present on creation response */
  secret?: string
}

// --- Servers ---

export type ServerStatus =
  | "offline"
  | "starting"
  | "running"
  | "stopping"
  | "restarting"
  | "installing"
  | "restoring"
  | "suspended"
  | "error"

export type PowerAction = "start" | "stop" | "restart" | "kill"

export interface Server {
  id: string
  uuid: string
  name: string
  description: string
  status: ServerStatus
  ownerId: string
  ownerName: string
  ownerEmail: string
  nodeId: string
  nodeName: string
  eggId: string
  eggName: string
  softwareName: string
  softwareVersion: string
  allocation: Allocation
  additionalAllocations: Allocation[]
  limits: ServerLimits
  featureLimits: ServerFeatureLimits
  createdAt: string
  updatedAt: string
  installedAt: string | null
  suspendedAt: string | null
}

export interface ServerLimits {
  memory: number // MB
  cpu: number // percentage (100 = 1 core)
  disk: number // MB
  io: number
  swap: number // MB
}

export interface ServerFeatureLimits {
  databases: number
  backups: number
  allocations: number
}

export interface ServerResources {
  cpuUsage: number // percentage
  memoryUsage: number // bytes
  memoryLimit: number // bytes
  diskUsage: number // bytes
  diskLimit: number // bytes
  networkRx: number // bytes
  networkTx: number // bytes
  uptime: number // milliseconds
  state: ServerStatus
}

export interface ServerCreateData {
  name: string
  description?: string
  eggId: string
  nodeId?: string
  allocationId?: string
  limits: ServerLimits
  featureLimits: ServerFeatureLimits
  startup?: string
  environment?: Record<string, string>
  dockerImage?: string
}

// --- Nodes ---

export type NodeStatus = "online" | "offline" | "maintenance"

export interface Node {
  id: string
  name: string
  description: string
  locationId: string
  location: string
  fqdn: string
  scheme: "http" | "https"
  status: NodeStatus
  memory: number // MB total
  memoryAllocated: number
  memoryOverallocate: number
  disk: number // MB total
  diskAllocated: number
  diskOverallocate: number
  daemonPort: number
  daemonSftp: number
  serverCount: number
  createdAt: string
  updatedAt: string
}

// --- Allocations ---

export interface Allocation {
  id: string
  ip: string
  port: number
  alias: string | null
  serverId: string | null
  serverName: string | null
  nodeId: string
  nodeName: string
  primary: boolean
  assigned: boolean
}

// --- Eggs / Software ---

export interface Egg {
  id: string
  name: string
  description: string
  dockerImage: string
  startupCommand: string
  variables: EggVariable[]
  installScript: string
  stopCommand: string
  supportedVersions: string[]
  category: string
  author: string
  createdAt: string
  updatedAt: string
}

export interface EggVariable {
  id: string
  name: string
  key: string
  value: string
  defaultValue: string
  description: string
  required: boolean
  editable: boolean
  rules: string
}

// --- Databases ---

export interface Database {
  id: string
  serverId: string
  name: string
  username: string
  host: string
  port: number
  maxConnections: number
  status: "active" | "creating" | "error"
  createdAt: string
  /** Only present when specifically requested */
  password?: string
}

// --- Backups ---

export type BackupStatus = "queued" | "creating" | "completed" | "failed" | "restoring" | "deleting"

export interface Backup {
  id: string
  serverId: string
  name: string
  size: number // bytes
  checksum: string | null
  status: BackupStatus
  createdAt: string
  completedAt: string | null
}

// --- Schedules ---

export type ScheduleAction = "command" | "power" | "backup"

export interface Schedule {
  id: string
  serverId: string
  name: string
  cron: string
  isActive: boolean
  onlyWhenOnline: boolean
  lastRunAt: string | null
  nextRunAt: string | null
  tasks: ScheduleTask[]
  createdAt: string
  updatedAt: string
}

export interface ScheduleTask {
  id: string
  scheduleId: string
  sequenceId: number
  action: ScheduleAction
  payload: string
  timeOffset: number // seconds delay after previous task
}

export interface ScheduleCreateData {
  name: string
  cron: string
  isActive: boolean
  onlyWhenOnline: boolean
}

export interface ScheduleTaskCreateData {
  action: ScheduleAction
  payload: string
  timeOffset: number
}

// --- Startup ---

export interface StartupConfiguration {
  startup: string
  dockerImage: string
  environment: Record<string, string>
  variables: EggVariable[]
}

// --- Files ---

export interface FileEntry {
  name: string
  isFile: boolean
  isSymlink: boolean
  isEditable: boolean
  mimetype: string
  size: number // bytes
  modifiedAt: string
  mode: string
}

// --- Activity / Audit ---

export interface AuditEvent {
  id: string
  actorId: string
  actorName: string
  actorEmail: string
  action: string
  targetType: string
  targetId: string
  targetName: string
  ip: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

// --- Pagination ---

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  perPage?: number
  search?: string
  sortBy?: string
  sortDir?: "asc" | "desc"
  filter?: Record<string, string>
}

// --- API Error ---

export interface ApiError {
  status: number
  code: string
  message: string
  errors?: Record<string, string[]>
}

// --- Admin Settings ---

export interface AdminSettings {
  general: {
    brandName: string
    supportUrl: string
    discordUrl: string
    documentationUrl: string
    dashboardUrl: string
  }
  hosting: {
    maxServersPerUser: number
    defaultMemory: number
    defaultCpu: number
    defaultDisk: number
    defaultDatabases: number
    defaultBackups: number
    defaultAllocations: number
  }
  registration: {
    enabled: boolean
    emailVerification: boolean
    requireInvite: boolean
  }
  security: {
    sessionLifetime: number // minutes
    requirePasswordChange: number // days, 0 = disabled
    require2fa: boolean
    minPasswordLength: number
  }
  infrastructure: {
    maintenanceMode: boolean
    maintenanceMessage: string
  }
}

// --- Server Subusers ---

export interface ServerSubuser {
  id: string
  userId: string
  userName: string
  userEmail: string
  permissions: ServerPermission[]
  createdAt: string
}

// --- Console ---

export interface ConsoleMessage {
  id: string
  content: string
  timestamp: string
  type: "output" | "command" | "system"
}
