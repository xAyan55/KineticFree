// ============================================================
// KineticHost — Mock Data (Development Only)
// ============================================================

import type {
  User, Server, Node, Allocation, Egg, EggVariable, Backup, Schedule,
  Database, AuditEvent, AdminSettings, ServerSubuser, ApiKey, Session,
  ServerResources, FileEntry, StartupConfiguration, ConsoleMessage,
} from "@/lib/types"

// --- Users ---
export const mockUsers: User[] = [
  {
    id: "usr_1",
    name: "Ayan",
    email: "ayan@kinetic.host",
    role: "admin",
    status: "active",
    avatarUrl: undefined,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-09-20T08:30:00Z",
    lastLoginAt: "2026-09-22T05:00:00Z",
    emailVerified: true,
    twoFactorEnabled: false,
    serverCount: 3,
  },
  {
    id: "usr_2",
    name: "Alex Craft",
    email: "alex@example.com",
    role: "user",
    status: "active",
    avatarUrl: undefined,
    createdAt: "2026-03-10T14:20:00Z",
    updatedAt: "2026-09-18T12:00:00Z",
    lastLoginAt: "2026-09-21T18:00:00Z",
    emailVerified: true,
    twoFactorEnabled: true,
    serverCount: 2,
  },
  {
    id: "usr_3",
    name: "Steve Builder",
    email: "steve@example.com",
    role: "user",
    status: "active",
    avatarUrl: undefined,
    createdAt: "2026-06-01T09:00:00Z",
    updatedAt: "2026-09-15T10:00:00Z",
    lastLoginAt: "2026-09-20T22:00:00Z",
    emailVerified: true,
    twoFactorEnabled: false,
    serverCount: 1,
  },
  {
    id: "usr_4",
    name: "Notch Hero",
    email: "notch@example.com",
    role: "user",
    status: "suspended",
    avatarUrl: undefined,
    createdAt: "2026-02-20T16:00:00Z",
    updatedAt: "2026-08-01T08:00:00Z",
    lastLoginAt: "2026-07-30T14:00:00Z",
    emailVerified: false,
    twoFactorEnabled: false,
    serverCount: 0,
  },
]

// --- Nodes ---
export const mockNodes: Node[] = [
  {
    id: "node_1",
    name: "India-01",
    description: "Primary node in Mumbai datacenter",
    locationId: "loc_1",
    location: "Mumbai, IN",
    fqdn: "in1.kinetic.host",
    scheme: "https",
    status: "online",
    memory: 65536, // 64 GB
    memoryAllocated: 28672,
    memoryOverallocate: 0,
    disk: 512000, // 500 GB
    diskAllocated: 140000,
    diskOverallocate: 0,
    daemonPort: 8080,
    daemonSftp: 2022,
    serverCount: 12,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-09-20T00:00:00Z",
  },
  {
    id: "node_2",
    name: "US-East-01",
    description: "US East Coast node",
    locationId: "loc_2",
    location: "Virginia, US",
    fqdn: "us1.kinetic.host",
    scheme: "https",
    status: "online",
    memory: 131072, // 128 GB
    memoryAllocated: 81920,
    memoryOverallocate: 0,
    disk: 1024000, // 1 TB
    diskAllocated: 450000,
    diskOverallocate: 0,
    daemonPort: 8080,
    daemonSftp: 2022,
    serverCount: 24,
    createdAt: "2026-02-15T00:00:00Z",
    updatedAt: "2026-09-21T00:00:00Z",
  },
  {
    id: "node_3",
    name: "EU-West-01",
    description: "European node in Frankfurt",
    locationId: "loc_3",
    location: "Frankfurt, DE",
    fqdn: "eu1.kinetic.host",
    scheme: "https",
    status: "maintenance",
    memory: 65536,
    memoryAllocated: 32768,
    memoryOverallocate: 0,
    disk: 512000,
    diskAllocated: 200000,
    diskOverallocate: 0,
    daemonPort: 8080,
    daemonSftp: 2022,
    serverCount: 8,
    createdAt: "2026-04-01T00:00:00Z",
    updatedAt: "2026-09-19T00:00:00Z",
  },
]

// --- Allocations ---
export const mockAllocations: Allocation[] = [
  { id: "alloc_1", ip: "103.28.55.10", port: 25565, alias: "play.kinetic.host", serverId: "srv_1", serverName: "Survival SMP", nodeId: "node_1", nodeName: "India-01", primary: true, assigned: true },
  { id: "alloc_2", ip: "103.28.55.10", port: 25566, alias: null, serverId: "srv_2", serverName: "Creative Build", nodeId: "node_1", nodeName: "India-01", primary: true, assigned: true },
  { id: "alloc_3", ip: "45.76.100.20", port: 25565, alias: null, serverId: "srv_3", serverName: "Modded Fabric", nodeId: "node_2", nodeName: "US-East-01", primary: true, assigned: true },
  { id: "alloc_4", ip: "45.76.100.20", port: 25566, alias: null, serverId: null, serverName: null, nodeId: "node_2", nodeName: "US-East-01", primary: false, assigned: false },
  { id: "alloc_5", ip: "45.76.100.20", port: 25567, alias: null, serverId: null, serverName: null, nodeId: "node_2", nodeName: "US-East-01", primary: false, assigned: false },
  { id: "alloc_6", ip: "185.210.50.30", port: 25565, alias: null, serverId: null, serverName: null, nodeId: "node_3", nodeName: "EU-West-01", primary: false, assigned: false },
]

// --- Eggs ---
export const mockEggs: Egg[] = [
  {
    id: "egg_1", name: "Vanilla", description: "Official Minecraft Java Edition server", dockerImage: "ghcr.io/pterodactyl/yolks:java_21",
    startupCommand: "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar server.jar nogui", stopCommand: "stop",
    variables: [
      { id: "var_1", name: "Server Version", key: "MINECRAFT_VERSION", value: "1.21.1", defaultValue: "latest", description: "The version of Minecraft to install", required: true, editable: true, rules: "required|string" },
    ],
    installScript: "#!/bin/bash\n# Install vanilla server", supportedVersions: ["1.21.1", "1.21", "1.20.6", "1.20.4", "1.20.2", "1.20.1"],
    category: "Minecraft", author: "KineticHost", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "egg_2", name: "Paper", description: "High-performance Paper Minecraft server with plugin support", dockerImage: "ghcr.io/pterodactyl/yolks:java_21",
    startupCommand: "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar server.jar nogui", stopCommand: "stop",
    variables: [
      { id: "var_2", name: "Server Version", key: "MINECRAFT_VERSION", value: "1.21.1", defaultValue: "latest", description: "The version of Paper to install", required: true, editable: true, rules: "required|string" },
      { id: "var_3", name: "Build Number", key: "BUILD_NUMBER", value: "latest", defaultValue: "latest", description: "The build number of Paper", required: false, editable: true, rules: "string" },
    ],
    installScript: "#!/bin/bash\n# Install Paper server", supportedVersions: ["1.21.1", "1.21", "1.20.6", "1.20.4", "1.20.2", "1.20.1"],
    category: "Minecraft", author: "KineticHost", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "egg_3", name: "Purpur", description: "Purpur is a drop-in replacement for Paper with extra gameplay features", dockerImage: "ghcr.io/pterodactyl/yolks:java_21",
    startupCommand: "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar server.jar nogui", stopCommand: "stop",
    variables: [
      { id: "var_4", name: "Server Version", key: "MINECRAFT_VERSION", value: "1.21.1", defaultValue: "latest", description: "Purpur version", required: true, editable: true, rules: "required|string" },
    ],
    installScript: "#!/bin/bash\n# Install Purpur", supportedVersions: ["1.21.1", "1.21", "1.20.6", "1.20.4"],
    category: "Minecraft", author: "KineticHost", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "egg_4", name: "Fabric", description: "Lightweight modding platform for Minecraft", dockerImage: "ghcr.io/pterodactyl/yolks:java_21",
    startupCommand: "java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar fabric-server-launch.jar nogui", stopCommand: "stop",
    variables: [
      { id: "var_5", name: "Minecraft Version", key: "MINECRAFT_VERSION", value: "1.21.1", defaultValue: "latest", description: "Minecraft version", required: true, editable: true, rules: "required|string" },
      { id: "var_6", name: "Fabric Loader Version", key: "LOADER_VERSION", value: "latest", defaultValue: "latest", description: "Fabric loader version", required: false, editable: true, rules: "string" },
    ],
    installScript: "#!/bin/bash\n# Install Fabric", supportedVersions: ["1.21.1", "1.21", "1.20.6", "1.20.4", "1.20.1"],
    category: "Minecraft", author: "KineticHost", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "egg_5", name: "Forge", description: "Minecraft Forge modding platform", dockerImage: "ghcr.io/pterodactyl/yolks:java_21",
    startupCommand: "java -Xms128M -Xmx{{SERVER_MEMORY}}M @libraries/net/minecraftforge/forge/*/unix_args.txt nogui", stopCommand: "stop",
    variables: [
      { id: "var_7", name: "Minecraft Version", key: "MINECRAFT_VERSION", value: "1.21.1", defaultValue: "latest", description: "Minecraft version", required: true, editable: true, rules: "required|string" },
      { id: "var_8", name: "Forge Version", key: "FORGE_VERSION", value: "latest", defaultValue: "latest", description: "Forge version", required: false, editable: true, rules: "string" },
    ],
    installScript: "#!/bin/bash\n# Install Forge", supportedVersions: ["1.21.1", "1.21", "1.20.6", "1.20.4", "1.20.1"],
    category: "Minecraft", author: "KineticHost", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "egg_6", name: "NeoForge", description: "Next-generation Forge fork", dockerImage: "ghcr.io/pterodactyl/yolks:java_21",
    startupCommand: "java -Xms128M -Xmx{{SERVER_MEMORY}}M @libraries/net/neoforged/neoforge/*/unix_args.txt nogui", stopCommand: "stop",
    variables: [
      { id: "var_9", name: "Minecraft Version", key: "MINECRAFT_VERSION", value: "1.21.1", defaultValue: "latest", description: "Minecraft version", required: true, editable: true, rules: "required|string" },
    ],
    installScript: "#!/bin/bash\n# Install NeoForge", supportedVersions: ["1.21.1", "1.21", "1.20.6", "1.20.4"],
    category: "Minecraft", author: "KineticHost", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-09-01T00:00:00Z",
  },
]

// --- Servers ---
export const mockServers: Server[] = [
  {
    id: "srv_1", uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Survival SMP", description: "Main survival multiplayer server",
    status: "running", ownerId: "usr_1", ownerName: "Ayan", ownerEmail: "ayan@kinetic.host",
    nodeId: "node_1", nodeName: "India-01", eggId: "egg_2", eggName: "Paper",
    softwareName: "Paper", softwareVersion: "1.21.1",
    allocation: mockAllocations[0],
    additionalAllocations: [],
    limits: { memory: 4096, cpu: 200, disk: 10240, io: 500, swap: 0 },
    featureLimits: { databases: 2, backups: 3, allocations: 1 },
    createdAt: "2026-03-15T10:00:00Z", updatedAt: "2026-09-20T08:00:00Z",
    installedAt: "2026-03-15T10:05:00Z", suspendedAt: null,
  },
  {
    id: "srv_2", uuid: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "Creative Build", description: "Creative mode building server",
    status: "offline", ownerId: "usr_1", ownerName: "Ayan", ownerEmail: "ayan@kinetic.host",
    nodeId: "node_1", nodeName: "India-01", eggId: "egg_1", eggName: "Vanilla",
    softwareName: "Vanilla", softwareVersion: "1.21.1",
    allocation: mockAllocations[1],
    additionalAllocations: [],
    limits: { memory: 2048, cpu: 100, disk: 5120, io: 500, swap: 0 },
    featureLimits: { databases: 1, backups: 2, allocations: 1 },
    createdAt: "2026-05-01T14:00:00Z", updatedAt: "2026-09-18T12:00:00Z",
    installedAt: "2026-05-01T14:03:00Z", suspendedAt: null,
  },
  {
    id: "srv_3", uuid: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    name: "Modded Fabric", description: "Fabric modpack server with Create and Cobblemon",
    status: "running", ownerId: "usr_1", ownerName: "Ayan", ownerEmail: "ayan@kinetic.host",
    nodeId: "node_2", nodeName: "US-East-01", eggId: "egg_4", eggName: "Fabric",
    softwareName: "Fabric", softwareVersion: "1.20.4",
    allocation: mockAllocations[2],
    additionalAllocations: [],
    limits: { memory: 8192, cpu: 300, disk: 20480, io: 500, swap: 0 },
    featureLimits: { databases: 3, backups: 5, allocations: 2 },
    createdAt: "2026-07-20T09:00:00Z", updatedAt: "2026-09-21T15:00:00Z",
    installedAt: "2026-07-20T09:08:00Z", suspendedAt: null,
  },
]

// --- Server Resources ---
export const mockServerResources: Record<string, ServerResources> = {
  srv_1: { cpuUsage: 34.2, memoryUsage: 2415919104, memoryLimit: 4294967296, diskUsage: 3221225472, diskLimit: 10737418240, networkRx: 1048576000, networkTx: 524288000, uptime: 259200000, state: "running" },
  srv_2: { cpuUsage: 0, memoryUsage: 0, memoryLimit: 2147483648, diskUsage: 1073741824, diskLimit: 5368709120, networkRx: 0, networkTx: 0, uptime: 0, state: "offline" },
  srv_3: { cpuUsage: 67.8, memoryUsage: 6442450944, memoryLimit: 8589934592, diskUsage: 8589934592, diskLimit: 21474836480, networkRx: 2097152000, networkTx: 1073741824, uptime: 86400000, state: "running" },
}

// --- Backups ---
export const mockBackups: Record<string, Backup[]> = {
  srv_1: [
    { id: "bak_1", serverId: "srv_1", name: "Daily Backup", size: 524288000, checksum: "sha256:abc123", status: "completed", createdAt: "2026-09-21T03:00:00Z", completedAt: "2026-09-21T03:02:30Z" },
    { id: "bak_2", serverId: "srv_1", name: "Pre-Update Backup", size: 512000000, checksum: "sha256:def456", status: "completed", createdAt: "2026-09-20T15:00:00Z", completedAt: "2026-09-20T15:01:45Z" },
  ],
  srv_2: [],
  srv_3: [
    { id: "bak_3", serverId: "srv_3", name: "World Backup", size: 2147483648, checksum: "sha256:ghi789", status: "completed", createdAt: "2026-09-21T06:00:00Z", completedAt: "2026-09-21T06:08:00Z" },
  ],
}

// --- Databases ---
export const mockDatabases: Record<string, Database[]> = {
  srv_1: [
    { id: "db_1", serverId: "srv_1", name: "s1_luckperms", username: "u1_luckperms", host: "db.kinetic.host", port: 3306, maxConnections: 10, status: "active", createdAt: "2026-04-01T10:00:00Z" },
  ],
  srv_2: [],
  srv_3: [
    { id: "db_2", serverId: "srv_3", name: "s3_cobblemon", username: "u3_cobblemon", host: "db.kinetic.host", port: 3306, maxConnections: 10, status: "active", createdAt: "2026-08-01T10:00:00Z" },
    { id: "db_3", serverId: "srv_3", name: "s3_economy", username: "u3_economy", host: "db.kinetic.host", port: 3306, maxConnections: 5, status: "active", createdAt: "2026-08-15T10:00:00Z" },
  ],
}

// --- Schedules ---
export const mockSchedules: Record<string, Schedule[]> = {
  srv_1: [
    {
      id: "sched_1", serverId: "srv_1", name: "Daily Restart", cron: "0 3 * * *", isActive: true, onlyWhenOnline: true,
      lastRunAt: "2026-09-21T03:00:00Z", nextRunAt: "2026-09-22T03:00:00Z",
      tasks: [
        { id: "task_1", scheduleId: "sched_1", sequenceId: 1, action: "command", payload: "say Server restarting in 60 seconds!", timeOffset: 0 },
        { id: "task_2", scheduleId: "sched_1", sequenceId: 2, action: "command", payload: "say Server restarting now!", timeOffset: 60 },
        { id: "task_3", scheduleId: "sched_1", sequenceId: 3, action: "power", payload: "restart", timeOffset: 5 },
      ],
      createdAt: "2026-04-01T10:00:00Z", updatedAt: "2026-09-20T10:00:00Z",
    },
    {
      id: "sched_2", serverId: "srv_1", name: "Hourly Backup", cron: "0 */6 * * *", isActive: true, onlyWhenOnline: true,
      lastRunAt: "2026-09-22T00:00:00Z", nextRunAt: "2026-09-22T06:00:00Z",
      tasks: [
        { id: "task_4", scheduleId: "sched_2", sequenceId: 1, action: "backup", payload: "", timeOffset: 0 },
      ],
      createdAt: "2026-05-01T10:00:00Z", updatedAt: "2026-09-20T10:00:00Z",
    },
  ],
  srv_2: [],
  srv_3: [],
}

// --- Files ---
export const mockFileSystem: Record<string, Record<string, FileEntry[]>> = {
  srv_1: {
    "/": [
      { name: "server.jar", isFile: true, isSymlink: false, isEditable: false, mimetype: "application/java-archive", size: 45088768, modifiedAt: "2026-09-20T08:00:00Z", mode: "644" },
      { name: "server.properties", isFile: true, isSymlink: false, isEditable: true, mimetype: "text/plain", size: 1024, modifiedAt: "2026-09-19T12:00:00Z", mode: "644" },
      { name: "eula.txt", isFile: true, isSymlink: false, isEditable: true, mimetype: "text/plain", size: 128, modifiedAt: "2026-03-15T10:05:00Z", mode: "644" },
      { name: "bukkit.yml", isFile: true, isSymlink: false, isEditable: true, mimetype: "text/yaml", size: 2048, modifiedAt: "2026-09-15T10:00:00Z", mode: "644" },
      { name: "spigot.yml", isFile: true, isSymlink: false, isEditable: true, mimetype: "text/yaml", size: 4096, modifiedAt: "2026-09-15T10:00:00Z", mode: "644" },
      { name: "paper.yml", isFile: true, isSymlink: false, isEditable: true, mimetype: "text/yaml", size: 8192, modifiedAt: "2026-09-15T10:00:00Z", mode: "644" },
      { name: "world", isFile: false, isSymlink: false, isEditable: false, mimetype: "inode/directory", size: 0, modifiedAt: "2026-09-21T03:00:00Z", mode: "755" },
      { name: "plugins", isFile: false, isSymlink: false, isEditable: false, mimetype: "inode/directory", size: 0, modifiedAt: "2026-09-20T15:00:00Z", mode: "755" },
      { name: "logs", isFile: false, isSymlink: false, isEditable: false, mimetype: "inode/directory", size: 0, modifiedAt: "2026-09-22T05:00:00Z", mode: "755" },
    ],
    "/plugins": [
      { name: "EssentialsX.jar", isFile: true, isSymlink: false, isEditable: false, mimetype: "application/java-archive", size: 12582912, modifiedAt: "2026-09-10T08:00:00Z", mode: "644" },
      { name: "WorldEdit.jar", isFile: true, isSymlink: false, isEditable: false, mimetype: "application/java-archive", size: 8388608, modifiedAt: "2026-08-20T08:00:00Z", mode: "644" },
      { name: "LuckPerms.jar", isFile: true, isSymlink: false, isEditable: false, mimetype: "application/java-archive", size: 6291456, modifiedAt: "2026-09-05T08:00:00Z", mode: "644" },
      { name: "EssentialsX", isFile: false, isSymlink: false, isEditable: false, mimetype: "inode/directory", size: 0, modifiedAt: "2026-09-18T10:00:00Z", mode: "755" },
    ],
    "/logs": [
      { name: "latest.log", isFile: true, isSymlink: false, isEditable: true, mimetype: "text/plain", size: 524288, modifiedAt: "2026-09-22T05:00:00Z", mode: "644" },
    ],
  },
}

export const mockFileContent: Record<string, string> = {
  "srv_1:/server.properties": `#Minecraft server properties
server-port=25565
gamemode=survival
difficulty=normal
max-players=20
motd=\\u00A7bKineticHost \\u00A7f- Survival SMP
online-mode=true
view-distance=10
spawn-protection=16
enable-command-block=false`,
  "srv_1:/eula.txt": `#By changing the setting below to TRUE you are indicating your agreement to our EULA (https://aka.ms/MinecraftEULA).
eula=true`,
}

// --- Startup ---
export const mockStartupConfigs: Record<string, StartupConfiguration> = {
  srv_1: {
    startup: "java -Xms128M -Xmx4096M -jar server.jar nogui",
    dockerImage: "ghcr.io/pterodactyl/yolks:java_21",
    environment: { MINECRAFT_VERSION: "1.21.1", BUILD_NUMBER: "latest" },
    variables: mockEggs[1].variables,
  },
  srv_2: {
    startup: "java -Xms128M -Xmx2048M -jar server.jar nogui",
    dockerImage: "ghcr.io/pterodactyl/yolks:java_21",
    environment: { MINECRAFT_VERSION: "1.21.1" },
    variables: mockEggs[0].variables,
  },
  srv_3: {
    startup: "java -Xms128M -Xmx8192M -jar fabric-server-launch.jar nogui",
    dockerImage: "ghcr.io/pterodactyl/yolks:java_21",
    environment: { MINECRAFT_VERSION: "1.20.4", LOADER_VERSION: "latest" },
    variables: mockEggs[3].variables,
  },
}

// --- Console ---
export const mockConsoleLogs: ConsoleMessage[] = [
  { id: "1", content: "[10:00:01 INFO]: Starting Minecraft server version 1.21.1", timestamp: "2026-09-22T10:00:01Z", type: "output" },
  { id: "2", content: "[10:00:02 INFO]: Loading properties", timestamp: "2026-09-22T10:00:02Z", type: "output" },
  { id: "3", content: "[10:00:02 INFO]: Default game type: SURVIVAL", timestamp: "2026-09-22T10:00:02Z", type: "output" },
  { id: "4", content: "[10:00:03 INFO]: Preparing level \"world\"", timestamp: "2026-09-22T10:00:03Z", type: "output" },
  { id: "5", content: "[10:00:08 INFO]: Preparing spawn area: 84%", timestamp: "2026-09-22T10:00:08Z", type: "output" },
  { id: "6", content: "[10:00:10 INFO]: Done (9.123s)! For help, type \"help\"", timestamp: "2026-09-22T10:00:10Z", type: "output" },
  { id: "7", content: "[10:00:15 INFO]: [Paper] Server permissions file permissions.yml is empty, ignoring it", timestamp: "2026-09-22T10:00:15Z", type: "output" },
  { id: "8", content: "[10:01:30 INFO]: Ayan joined the game", timestamp: "2026-09-22T10:01:30Z", type: "output" },
  { id: "9", content: "[10:02:00 INFO]: <Ayan> Hello server!", timestamp: "2026-09-22T10:02:00Z", type: "output" },
]

// --- Subusers ---
export const mockSubusers: Record<string, ServerSubuser[]> = {
  srv_1: [
    { id: "su_1", userId: "usr_2", userName: "Alex Craft", userEmail: "alex@example.com", permissions: ["console", "control.start", "control.stop", "control.restart", "files.read"], createdAt: "2026-05-01T10:00:00Z" },
    { id: "su_2", userId: "usr_3", userName: "Steve Builder", userEmail: "steve@example.com", permissions: ["console", "control.restart"], createdAt: "2026-06-15T10:00:00Z" },
  ],
  srv_2: [],
  srv_3: [],
}

// --- API Keys ---
export const mockApiKeys: ApiKey[] = [
  { id: "key_1", identifier: "kh_prod_a1b2c3", description: "Production API Key", lastUsedAt: "2026-09-21T18:00:00Z", createdAt: "2026-06-01T10:00:00Z" },
  { id: "key_2", identifier: "kh_dev_d4e5f6", description: "Development Key", lastUsedAt: null, createdAt: "2026-09-01T10:00:00Z" },
]

// --- Sessions ---
export const mockSessions: Session[] = [
  { id: "sess_1", ip: "103.28.55.100", browser: "Chrome 128", os: "Windows 11", lastActive: "2026-09-22T05:00:00Z", current: true, createdAt: "2026-09-22T04:00:00Z" },
  { id: "sess_2", ip: "203.0.113.50", browser: "Firefox 131", os: "macOS 15", lastActive: "2026-09-21T22:00:00Z", current: false, createdAt: "2026-09-21T20:00:00Z" },
]

// --- Audit Log ---
export const mockAuditEvents: AuditEvent[] = [
  { id: "audit_1", actorId: "usr_1", actorName: "Ayan", actorEmail: "ayan@kinetic.host", action: "server.power", targetType: "server", targetId: "srv_1", targetName: "Survival SMP", ip: "103.28.55.100", metadata: { action: "start" }, createdAt: "2026-09-22T04:30:00Z" },
  { id: "audit_2", actorId: "usr_1", actorName: "Ayan", actorEmail: "ayan@kinetic.host", action: "server.settings.update", targetType: "server", targetId: "srv_1", targetName: "Survival SMP", ip: "103.28.55.100", metadata: { field: "description" }, createdAt: "2026-09-21T18:00:00Z" },
  { id: "audit_3", actorId: "usr_1", actorName: "Ayan", actorEmail: "ayan@kinetic.host", action: "backup.create", targetType: "server", targetId: "srv_1", targetName: "Survival SMP", ip: "103.28.55.100", metadata: { name: "Daily Backup" }, createdAt: "2026-09-21T03:00:00Z" },
  { id: "audit_4", actorId: "usr_1", actorName: "Ayan", actorEmail: "ayan@kinetic.host", action: "user.login", targetType: "user", targetId: "usr_1", targetName: "Ayan", ip: "103.28.55.100", metadata: {}, createdAt: "2026-09-22T04:00:00Z" },
  { id: "audit_5", actorId: "usr_1", actorName: "Ayan", actorEmail: "ayan@kinetic.host", action: "server.create", targetType: "server", targetId: "srv_3", targetName: "Modded Fabric", ip: "103.28.55.100", metadata: { egg: "Fabric" }, createdAt: "2026-07-20T09:00:00Z" },
]

// --- Admin Settings ---
export const mockAdminSettings: AdminSettings = {
  general: { brandName: "KineticHost", supportUrl: "https://support.kinetic.host", discordUrl: "https://discord.gg/kinetichost", documentationUrl: "https://docs.kinetic.host", dashboardUrl: "https://panel.kinetic.host" },
  hosting: { maxServersPerUser: 5, defaultMemory: 2048, defaultCpu: 100, defaultDisk: 5120, defaultDatabases: 1, defaultBackups: 2, defaultAllocations: 1 },
  registration: { enabled: true, emailVerification: false, requireInvite: false },
  security: { sessionLifetime: 1440, requirePasswordChange: 0, require2fa: false, minPasswordLength: 8 },
  infrastructure: { maintenanceMode: false, maintenanceMessage: "" },
}
