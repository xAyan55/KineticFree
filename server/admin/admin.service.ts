import crypto from "crypto"
import { db } from "../db/database.js"
import { HttpError } from "../middleware/error-handler.js"
import { formatServer, ServerRow } from "../servers/servers.service.js"

export const adminService = {
  getStats() {
    const totalUsers = (db.prepare("SELECT COUNT(*) as count FROM users").get() as any).count
    const activeUsers = (db.prepare("SELECT COUNT(*) as count FROM users WHERE status = 'active'").get() as any).count

    const totalServers = (db.prepare("SELECT COUNT(*) as count FROM servers").get() as any).count
    const runningServers = (db.prepare("SELECT COUNT(*) as count FROM servers WHERE status = 'running'").get() as any).count

    const totalNodes = (db.prepare("SELECT COUNT(*) as count FROM nodes").get() as any).count
    const onlineNodes = (db.prepare("SELECT COUNT(*) as count FROM nodes WHERE status = 'online'").get() as any).count

    const memoryAllocated = (db.prepare("SELECT SUM(memory) as total FROM servers").get() as any).total || 0
    const totalMemory = (db.prepare("SELECT SUM(memory) as total FROM nodes").get() as any).total || 8192

    const diskAllocated = (db.prepare("SELECT SUM(disk) as total FROM servers").get() as any).total || 0
    const totalDisk = (db.prepare("SELECT SUM(disk) as total FROM nodes").get() as any).total || 51200

    return {
      totalUsers,
      activeUsers,
      totalServers,
      runningServers,
      totalNodes,
      onlineNodes,
      allocatedMemory: memoryAllocated,
      totalMemory,
      allocatedDisk: diskAllocated,
      totalDisk,
    }
  },

  getSettings() {
    const rows = db.prepare("SELECT key, value FROM admin_settings").all() as any[]
    const settings: Record<string, any> = {}
    for (const row of rows) {
      try {
        settings[row.key] = JSON.parse(row.value)
      } catch {
        settings[row.key] = row.value
      }
    }
    return settings
  },

  updateSettings(data: Record<string, any>) {
    const updateStmt = db.prepare(`
      INSERT INTO admin_settings (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `)

    for (const [key, value] of Object.entries(data)) {
      updateStmt.run(key, JSON.stringify(value))
    }

    return this.getSettings()
  },

  getAuditLogs(params?: { page?: number; perPage?: number; search?: string }) {
    const page = Number(params?.page) || 1
    const perPage = Number(params?.perPage) || 25
    const search = params?.search ? `%${params.search.trim()}%` : null

    let query = "SELECT * FROM audit_logs"
    const args: any[] = []
    if (search) {
      query += " WHERE action LIKE ? OR actor_name LIKE ? OR actor_email LIKE ? OR target_name LIKE ?"
      args.push(search, search, search, search)
    }
    query += " ORDER BY created_at DESC"

    const rows = db.prepare(query).all(...args) as any[]
    const total = rows.length
    const totalPages = Math.ceil(total / perPage) || 1
    const start = (page - 1) * perPage
    const paged = rows.slice(start, start + perPage).map((r) => ({
      id: r.id,
      actorId: r.actor_id,
      actorName: r.actor_name,
      actorEmail: r.actor_email,
      action: r.action,
      targetType: r.target_type,
      targetId: r.target_id,
      targetName: r.target_name,
      ip: r.ip,
      metadata: r.metadata ? JSON.parse(r.metadata) : {},
      createdAt: r.created_at,
    }))

    return {
      data: paged,
      page,
      perPage,
      total,
      totalPages,
    }
  },

  getServers(params?: { page?: number; perPage?: number; search?: string }) {
    const page = Number(params?.page) || 1
    const perPage = Number(params?.perPage) || 25
    const search = params?.search ? `%${params.search.trim()}%` : null

    let query = "SELECT * FROM servers"
    const args: any[] = []
    if (search) {
      query += " WHERE name LIKE ? OR identifier LIKE ?"
      args.push(search, search)
    }
    query += " ORDER BY created_at DESC"

    const rows = db.prepare(query).all(...args) as ServerRow[]
    const total = rows.length
    const totalPages = Math.ceil(total / perPage) || 1
    const start = (page - 1) * perPage
    const data = rows.slice(start, start + perPage).map(formatServer)

    return {
      data,
      page,
      perPage,
      total,
      totalPages,
    }
  },

  suspendServer(id: string) {
    const server = db.prepare("SELECT id FROM servers WHERE id = ?").get(id)
    if (!server) throw new HttpError(404, "SERVER_NOT_FOUND", "Server not found.")
    db.prepare("UPDATE servers SET suspended = 1, status = 'suspended', suspended_at = datetime('now') WHERE id = ?").run(id)
  },

  unsuspendServer(id: string) {
    const server = db.prepare("SELECT id FROM servers WHERE id = ?").get(id)
    if (!server) throw new HttpError(404, "SERVER_NOT_FOUND", "Server not found.")
    db.prepare("UPDATE servers SET suspended = 0, status = 'offline', suspended_at = NULL WHERE id = ?").run(id)
  },

  // Users
  getUsers(params?: { page?: number; perPage?: number; search?: string }) {
    const page = Number(params?.page) || 1
    const perPage = Number(params?.perPage) || 25
    const search = params?.search ? `%${params.search.trim()}%` : null

    let query = `
      SELECT u.*, (SELECT COUNT(*) FROM servers s WHERE s.owner_id = u.id) as server_count
      FROM users u
    `
    const args: any[] = []
    if (search) {
      query += " WHERE u.name LIKE ? OR u.email LIKE ? OR u.username LIKE ?"
      args.push(search, search, search)
    }
    query += " ORDER BY u.created_at DESC"

    const rows = db.prepare(query).all(...args) as any[]
    const total = rows.length
    const totalPages = Math.ceil(total / perPage) || 1
    const start = (page - 1) * perPage
    const data = rows.slice(start, start + perPage).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      avatarUrl: u.avatar_url || undefined,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
      lastLoginAt: u.last_login_at,
      emailVerified: Boolean(u.email_verified),
      twoFactorEnabled: Boolean(u.two_factor_enabled),
      serverCount: u.server_count,
    }))

    return { data, page, perPage, total, totalPages }
  },

  getUser(id: string) {
    const u = db
      .prepare(`
        SELECT u.*, (SELECT COUNT(*) FROM servers s WHERE s.owner_id = u.id) as server_count
        FROM users u WHERE u.id = ?
      `)
      .get(id) as any

    if (!u) throw new HttpError(404, "USER_NOT_FOUND", "User not found.")

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      avatarUrl: u.avatar_url || undefined,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
      lastLoginAt: u.last_login_at,
      emailVerified: Boolean(u.email_verified),
      twoFactorEnabled: Boolean(u.two_factor_enabled),
      serverCount: u.server_count,
    }
  },

  updateUser(id: string, data: any) {
    this.getUser(id)
    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      updates.push("name = ?")
      values.push(data.name.trim())
    }
    if (data.role !== undefined && ["user", "admin"].includes(data.role)) {
      updates.push("role = ?")
      values.push(data.role)
    }
    if (data.memoryLimit !== undefined) {
      updates.push("memory_limit = ?")
      values.push(Number(data.memoryLimit))
    }
    if (data.cpuLimit !== undefined) {
      updates.push("cpu_limit = ?")
      values.push(Number(data.cpuLimit))
    }
    if (data.diskLimit !== undefined) {
      updates.push("disk_limit = ?")
      values.push(Number(data.diskLimit))
    }
    if (data.serverLimit !== undefined) {
      updates.push("server_limit = ?")
      values.push(Number(data.serverLimit))
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')")
      values.push(id)
      db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values)
    }

    return this.getUser(id)
  },

  suspendUser(id: string) {
    const user = this.getUser(id)
    db.prepare("UPDATE users SET status = 'suspended', updated_at = datetime('now') WHERE id = ?").run(id)
    // Revoke all sessions
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(id)
  },

  unsuspendUser(id: string) {
    this.getUser(id)
    db.prepare("UPDATE users SET status = 'active', updated_at = datetime('now') WHERE id = ?").run(id)
  },

  deleteUser(id: string) {
    this.getUser(id)
    db.prepare("DELETE FROM users WHERE id = ?").run(id)
  },

  // Nodes
  getNodes() {
    const rows = db.prepare("SELECT * FROM nodes ORDER BY created_at ASC").all() as any[]
    return rows.map((n) => {
      const serverCount = (
        db.prepare("SELECT COUNT(*) as count FROM servers WHERE node_id = ?").get(n.id) as any
      ).count
      const memoryAllocated = (
        db.prepare("SELECT SUM(memory) as total FROM servers WHERE node_id = ?").get(n.id) as any
      ).total || 0
      const diskAllocated = (
        db.prepare("SELECT SUM(disk) as total FROM servers WHERE node_id = ?").get(n.id) as any
      ).total || 0

      return {
        id: n.id,
        name: n.name,
        description: n.description || "",
        locationId: n.location_id,
        location: n.location,
        fqdn: n.fqdn,
        scheme: n.scheme,
        status: n.status,
        memory: n.memory,
        memoryAllocated,
        memoryOverallocate: n.memory_overallocate,
        disk: n.disk,
        diskAllocated,
        diskOverallocate: n.disk_overallocate,
        daemonPort: n.daemon_listen,
        daemonSftp: n.daemon_sftp,
        serverCount,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      }
    })
  },

  getNode(id: string) {
    const nodes = this.getNodes()
    const found = nodes.find((n) => n.id === id)
    if (!found) throw new HttpError(404, "NODE_NOT_FOUND", "Node not found.")
    return found
  },

  createNode(data: any) {
    const id = crypto.randomUUID()
    db.prepare(`
      INSERT INTO nodes (
        id, name, description, location_id, location, fqdn, scheme, status,
        memory, memory_overallocate, disk, disk_overallocate, daemon_listen, daemon_sftp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'offline', ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.name || "New Node",
      data.description || "",
      data.locationId || "loc-local",
      data.location || "Local",
      data.fqdn || "127.0.0.1",
      data.scheme || "http",
      data.memory || 8192,
      data.memoryOverallocate || 0,
      data.disk || 51200,
      data.diskOverallocate || 0,
      data.daemonPort || 8080,
      data.daemonSftp || 2022
    )

    return this.getNode(id)
  },

  updateNode(id: string, data: any) {
    this.getNode(id)
    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      updates.push("name = ?")
      values.push(data.name)
    }
    if (data.description !== undefined) {
      updates.push("description = ?")
      values.push(data.description)
    }
    if (data.fqdn !== undefined) {
      updates.push("fqdn = ?")
      values.push(data.fqdn)
    }
    if (data.scheme !== undefined) {
      updates.push("scheme = ?")
      values.push(data.scheme)
    }
    if (data.memory !== undefined) {
      updates.push("memory = ?")
      values.push(Number(data.memory))
    }
    if (data.disk !== undefined) {
      updates.push("disk = ?")
      values.push(Number(data.disk))
    }
    if (data.daemonPort !== undefined) {
      updates.push("daemon_listen = ?")
      values.push(Number(data.daemonPort))
    }
    if (data.daemonSftp !== undefined) {
      updates.push("daemon_sftp = ?")
      values.push(Number(data.daemonSftp))
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')")
      values.push(id)
      db.prepare(`UPDATE nodes SET ${updates.join(", ")} WHERE id = ?`).run(...values)
    }

    return this.getNode(id)
  },

  deleteNode(id: string) {
    this.getNode(id)
    const serverCount = (
      db.prepare("SELECT COUNT(*) as count FROM servers WHERE node_id = ?").get(id) as any
    ).count
    if (serverCount > 0) {
      throw new HttpError(400, "NODE_HAS_SERVERS", "Cannot delete a node that has servers assigned to it.")
    }
    db.prepare("DELETE FROM nodes WHERE id = ?").run(id)
  },

  // Allocations
  getAllocations(params?: { page?: number; perPage?: number; search?: string }) {
    const page = Number(params?.page) || 1
    const perPage = Number(params?.perPage) || 25

    const rows = db
      .prepare(`
        SELECT a.id, a.ip, a.port, a.alias, a.assigned, a.is_primary as [primary],
               a.server_id as serverId, a.node_id as nodeId,
               s.name as serverName, n.name as nodeName
        FROM allocations a
        JOIN nodes n ON n.id = a.node_id
        LEFT JOIN servers s ON s.id = a.server_id
        ORDER BY a.ip ASC, a.port ASC
      `)
      .all() as any[]

    const total = rows.length
    const totalPages = Math.ceil(total / perPage) || 1
    const start = (page - 1) * perPage
    const data = rows.slice(start, start + perPage).map((a) => ({
      id: a.id,
      ip: a.ip,
      port: a.port,
      alias: a.alias,
      serverId: a.serverId,
      serverName: a.serverName,
      nodeId: a.nodeId,
      nodeName: a.nodeName,
      primary: Boolean(a.primary),
      assigned: Boolean(a.assigned),
    }))

    return { data, page, perPage, total, totalPages }
  },

  createAllocation(data: any) {
    const id = crypto.randomUUID()
    const nodeId = data.nodeId || "node-local"
    const ip = data.ip || "127.0.0.1"
    const port = Number(data.port)

    if (!port || isNaN(port) || port < 1 || port > 65535) {
      throw new HttpError(400, "INVALID_PORT", "A valid port between 1 and 65535 is required.")
    }

    const existing = db
      .prepare("SELECT id FROM allocations WHERE node_id = ? AND ip = ? AND port = ?")
      .get(nodeId, ip, port)
    if (existing) {
      throw new HttpError(409, "ALLOCATION_EXISTS", "This IP and port allocation already exists on this node.")
    }

    db.prepare(`
      INSERT INTO allocations (id, node_id, ip, port, alias, assigned, is_primary)
      VALUES (?, ?, ?, ?, ?, 0, 0)
    `).run(id, nodeId, ip, port, data.alias || null)

    const node = db.prepare("SELECT name FROM nodes WHERE id = ?").get(nodeId) as any
    return {
      id,
      ip,
      port,
      alias: data.alias || null,
      serverId: null,
      serverName: null,
      nodeId,
      nodeName: node ? node.name : "Node",
      primary: false,
      assigned: false,
    }
  },

  deleteAllocation(id: string) {
    const alloc = db.prepare("SELECT * FROM allocations WHERE id = ?").get(id) as any
    if (!alloc) throw new HttpError(404, "ALLOCATION_NOT_FOUND", "Allocation not found.")
    if (alloc.assigned) {
      throw new HttpError(400, "ALLOCATION_ASSIGNED", "Cannot delete an allocation currently assigned to a server.")
    }
    db.prepare("DELETE FROM allocations WHERE id = ?").run(id)
  },

  // Eggs
  getEggs() {
    const rows = db.prepare("SELECT * FROM eggs ORDER BY name ASC").all() as any[]
    return rows.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description || "",
      dockerImage: e.docker_image,
      startupCommand: e.startup_command,
      stopCommand: e.stop_command,
      installScript: e.install_script || "",
      supportedVersions: e.supported_versions ? JSON.parse(e.supported_versions) : [],
      variables: e.variables ? JSON.parse(e.variables) : [],
      category: e.category,
      author: e.author,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
    }))
  },

  getEgg(id: string) {
    const egg = this.getEggs().find((e) => e.id === id)
    if (!egg) throw new HttpError(404, "EGG_NOT_FOUND", "Egg template not found.")
    return egg
  },

  createEgg(data: any) {
    const id = data.id || crypto.randomUUID()
    db.prepare(`
      INSERT INTO eggs (
        id, name, description, category, author, docker_image, startup_command,
        stop_command, install_script, supported_versions, variables
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.name || "New Egg",
      data.description || "",
      data.category || "Minecraft",
      data.author || "KineticHost",
      data.dockerImage || "ghcr.io/pterodactyl/yolks:java_21",
      data.startupCommand || "java -jar server.jar",
      data.stopCommand || "stop",
      data.installScript || "",
      JSON.stringify(data.supportedVersions || ["latest"]),
      JSON.stringify(data.variables || [])
    )

    return this.getEgg(id)
  },

  updateEgg(id: string, data: any) {
    this.getEgg(id)
    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      updates.push("name = ?")
      values.push(data.name)
    }
    if (data.description !== undefined) {
      updates.push("description = ?")
      values.push(data.description)
    }
    if (data.dockerImage !== undefined) {
      updates.push("docker_image = ?")
      values.push(data.dockerImage)
    }
    if (data.startupCommand !== undefined) {
      updates.push("startup_command = ?")
      values.push(data.startupCommand)
    }
    if (data.stopCommand !== undefined) {
      updates.push("stop_command = ?")
      values.push(data.stopCommand)
    }
    if (data.supportedVersions !== undefined) {
      updates.push("supported_versions = ?")
      values.push(JSON.stringify(data.supportedVersions))
    }
    if (data.variables !== undefined) {
      updates.push("variables = ?")
      values.push(JSON.stringify(data.variables))
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')")
      values.push(id)
      db.prepare(`UPDATE eggs SET ${updates.join(", ")} WHERE id = ?`).run(...values)
    }

    return this.getEgg(id)
  },

  deleteEgg(id: string) {
    this.getEgg(id)
    const serverCount = (
      db.prepare("SELECT COUNT(*) as count FROM servers WHERE egg_id = ?").get(id) as any
    ).count
    if (serverCount > 0) {
      throw new HttpError(400, "EGG_IN_USE", "Cannot delete an egg template that has active servers using it.")
    }
    db.prepare("DELETE FROM eggs WHERE id = ?").run(id)
  },
}
