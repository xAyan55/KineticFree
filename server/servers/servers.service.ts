import crypto from "crypto"
import { db } from "../db/database.js"
import { HttpError } from "../middleware/error-handler.js"
import { UserRow } from "../auth/auth.service.js"

export interface ServerRow {
  id: string
  uuid: string
  identifier: string
  name: string
  description: string | null
  owner_id: string
  node_id: string
  allocation_id: string | null
  egg_id: string | null
  status: string
  suspended: number
  memory: number
  cpu: number
  disk: number
  swap: number
  io: number
  databases_limit: number
  backups_limit: number
  allocations_limit: number
  startup: string | null
  environment: string | null
  docker_image: string | null
  installed_at: string | null
  suspended_at: string | null
  created_at: string
  updated_at: string
}

export function formatServer(row: ServerRow) {
  const owner = db.prepare("SELECT name, email FROM users WHERE id = ?").get(row.owner_id) as any || {
    name: "Unknown",
    email: "unknown@example.com",
  }

  const node = db.prepare("SELECT name, fqdn FROM nodes WHERE id = ?").get(row.node_id) as any || {
    name: "Local Node",
    fqdn: "127.0.0.1",
  }

  const egg = db.prepare("SELECT name FROM eggs WHERE id = ?").get(row.egg_id || "") as any || {
    name: "Minecraft Java",
  }

  // Primary allocation
  let primaryAllocation: any = null
  if (row.allocation_id) {
    const alloc = db.prepare("SELECT * FROM allocations WHERE id = ?").get(row.allocation_id) as any
    if (alloc) {
      primaryAllocation = {
        id: alloc.id,
        ip: alloc.ip,
        port: alloc.port,
        alias: alloc.alias,
        serverId: row.id,
        serverName: row.name,
        nodeId: alloc.node_id,
        nodeName: node.name,
        primary: true,
        assigned: true,
      }
    }
  }

  if (!primaryAllocation) {
    primaryAllocation = {
      id: "alloc-none",
      ip: node.fqdn || "127.0.0.1",
      port: 25565,
      alias: null,
      serverId: row.id,
      serverName: row.name,
      nodeId: row.node_id,
      nodeName: node.name,
      primary: true,
      assigned: true,
    }
  }

  // Additional allocations
  const otherAllocs = db
    .prepare("SELECT * FROM allocations WHERE server_id = ? AND id != ?")
    .all(row.id, row.allocation_id || "") as any[]

  const additionalAllocations = otherAllocs.map((a) => ({
    id: a.id,
    ip: a.ip,
    port: a.port,
    alias: a.alias,
    serverId: row.id,
    serverName: row.name,
    nodeId: a.node_id,
    nodeName: node.name,
    primary: false,
    assigned: true,
  }))

  return {
    id: row.id,
    uuid: row.uuid,
    name: row.name,
    description: row.description || "",
    status: row.suspended ? "suspended" : row.status,
    ownerId: row.owner_id,
    ownerName: owner.name,
    ownerEmail: owner.email,
    nodeId: row.node_id,
    nodeName: node.name,
    eggId: row.egg_id || "paper-mc",
    eggName: egg.name,
    softwareName: egg.name,
    softwareVersion: "Latest",
    allocation: primaryAllocation,
    additionalAllocations,
    limits: {
      memory: row.memory,
      cpu: row.cpu,
      disk: row.disk,
      io: row.io,
      swap: row.swap,
    },
    featureLimits: {
      databases: row.databases_limit,
      backups: row.backups_limit,
      allocations: row.allocations_limit,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    installedAt: row.installed_at,
    suspendedAt: row.suspended_at,
  }
}

export const serversService = {
  listForUser(user: UserRow): any[] {
    let rows: ServerRow[] = []
    if (user.role === "admin") {
      rows = db.prepare("SELECT * FROM servers ORDER BY created_at DESC").all() as ServerRow[]
    } else {
      // Servers owned or subuser of
      rows = db
        .prepare(`
          SELECT DISTINCT s.* FROM servers s
          LEFT JOIN server_subusers su ON su.server_id = s.id
          WHERE s.owner_id = ? OR su.user_id = ?
          ORDER BY s.created_at DESC
        `)
        .all(user.id, user.id) as ServerRow[]
    }

    return rows.map(formatServer)
  },

  getById(serverId: string, user: UserRow): any {
    const row = db.prepare("SELECT * FROM servers WHERE id = ?").get(serverId) as ServerRow | undefined
    if (!row) {
      throw new HttpError(404, "SERVER_NOT_FOUND", "Server not found.")
    }

    if (user.role !== "admin" && row.owner_id !== user.id) {
      const isSubuser = db
        .prepare("SELECT id FROM server_subusers WHERE server_id = ? AND user_id = ?")
        .get(serverId, user.id)
      if (!isSubuser) {
        throw new HttpError(403, "FORBIDDEN", "You do not have permission to view this server.")
      }
    }

    return formatServer(row)
  },

  create(user: UserRow, data: any): any {
    // Check server quota
    const ownedCount = (
      db.prepare("SELECT COUNT(*) as count FROM servers WHERE owner_id = ?").get(user.id) as any
    ).count

    if (user.role !== "admin" && ownedCount >= user.server_limit) {
      throw new HttpError(
        400,
        "QUOTA_EXCEEDED",
        `Server limit reached. You can only own up to ${user.server_limit} servers.`
      )
    }

    const name = (data.name || "").trim()
    if (!name) {
      throw new HttpError(400, "BAD_REQUEST", "Server name is required.")
    }

    const eggId = data.eggId || "paper-mc"
    const egg = db.prepare("SELECT * FROM eggs WHERE id = ?").get(eggId) as any
    if (!egg) {
      throw new HttpError(400, "INVALID_EGG", "Selected egg software template was not found.")
    }

    // Determine node
    let nodeId = data.nodeId
    if (!nodeId) {
      const node = db.prepare("SELECT id FROM nodes LIMIT 1").get() as any
      if (!node) {
        throw new HttpError(500, "NO_NODES", "No compute nodes available in the cluster.")
      }
      nodeId = node.id
    }

    // Allocate port
    let allocationId = data.allocationId
    if (!allocationId) {
      const freeAlloc = db
        .prepare("SELECT id FROM allocations WHERE node_id = ? AND assigned = 0 LIMIT 1")
        .get(nodeId) as any
      if (freeAlloc) {
        allocationId = freeAlloc.id
      }
    }

    const serverId = crypto.randomUUID()
    const uuid = crypto.randomUUID()
    const identifier = uuid.substring(0, 8)

    const memory = data.limits?.memory || 2048
    const cpu = data.limits?.cpu || 100
    const disk = data.limits?.disk || 5120
    const swap = data.limits?.swap || 0
    const io = data.limits?.io || 500

    const databasesLimit = data.featureLimits?.databases ?? 2
    const backupsLimit = data.featureLimits?.backups ?? 2
    const allocationsLimit = data.featureLimits?.allocations ?? 1

    db.prepare(`
      INSERT INTO servers (
        id, uuid, identifier, name, description, owner_id, node_id, allocation_id, egg_id,
        status, memory, cpu, disk, swap, io, databases_limit, backups_limit, allocations_limit,
        startup, environment, docker_image, installed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'installing', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      serverId,
      uuid,
      identifier,
      name,
      data.description || "",
      user.id,
      nodeId,
      allocationId,
      eggId,
      memory,
      cpu,
      disk,
      swap,
      io,
      databasesLimit,
      backupsLimit,
      allocationsLimit,
      data.startup || egg.startup_command,
      JSON.stringify(data.environment || {}),
      data.dockerImage || egg.docker_image
    )

    if (allocationId) {
      db.prepare("UPDATE allocations SET assigned = 1, server_id = ?, is_primary = 1 WHERE id = ?").run(
        serverId,
        allocationId
      )
    }

    // Record audit log
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, action, target_type, target_id, target_name)
      VALUES (?, ?, ?, ?, 'server:create', 'server', ?, ?)
    `).run(crypto.randomUUID(), user.id, user.name, user.email, serverId, name)

    const created = db.prepare("SELECT * FROM servers WHERE id = ?").get(serverId) as ServerRow
    return formatServer(created)
  },

  update(serverId: string, user: UserRow, data: any): any {
    this.getById(serverId, user) // auth & existence check

    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      updates.push("name = ?")
      values.push(data.name.trim())
    }
    if (data.description !== undefined) {
      updates.push("description = ?")
      values.push(data.description.trim())
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')")
      values.push(serverId)
      db.prepare(`UPDATE servers SET ${updates.join(", ")} WHERE id = ?`).run(...values)
    }

    const row = db.prepare("SELECT * FROM servers WHERE id = ?").get(serverId) as ServerRow
    return formatServer(row)
  },

  delete(serverId: string, user: UserRow): void {
    const server = db.prepare("SELECT * FROM servers WHERE id = ?").get(serverId) as ServerRow | undefined
    if (!server) {
      throw new HttpError(404, "SERVER_NOT_FOUND", "Server not found.")
    }

    if (user.role !== "admin" && server.owner_id !== user.id) {
      throw new HttpError(403, "FORBIDDEN", "Only server owners or administrators can delete servers.")
    }

    // Free allocations
    db.prepare("UPDATE allocations SET assigned = 0, server_id = NULL, is_primary = 0 WHERE server_id = ?").run(
      serverId
    )

    // Delete server (cascades databases, backups, schedules)
    db.prepare("DELETE FROM servers WHERE id = ?").run(serverId)

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, actor_email, action, target_type, target_id, target_name)
      VALUES (?, ?, ?, ?, 'server:delete', 'server', ?, ?)
    `).run(crypto.randomUUID(), user.id, user.name, user.email, serverId, server.name)
  },
}
