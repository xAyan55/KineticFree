import crypto from "crypto"
import bcrypt from "bcryptjs"
import { db } from "./database.js"
import { config } from "../config.js"

export function seedDatabase(): void {
  // 1. Seed Admin User
  const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(config.admin.email) as any

  if (!existingAdmin) {
    const adminId = crypto.randomUUID()
    const passwordHash = bcrypt.hashSync(config.admin.password, 10)
    const username = config.admin.name.toLowerCase().replace(/[^a-z0-9]/g, "") || "admin"

    db.prepare(`
      INSERT INTO users (id, email, username, name, password_hash, role, root_admin, status, email_verified)
      VALUES (?, ?, ?, ?, ?, 'admin', 1, 'active', 1)
    `).run(adminId, config.admin.email, username, config.admin.name, passwordHash)

    console.log(`[Seed] Admin user seeded: ${config.admin.email}`)
  } else if (existingAdmin.role !== "admin" || !existingAdmin.root_admin) {
    db.prepare("UPDATE users SET role = 'admin', root_admin = 1 WHERE id = ?").run(existingAdmin.id)
  }

  // 2. Seed Default Egg
  const existingEgg = db.prepare("SELECT * FROM eggs WHERE id = ?").get("paper-mc")
  if (!existingEgg) {
    const supportedVersions = JSON.stringify(["1.21.4", "1.21.3", "1.21.1", "1.20.4", "1.20.2", "1.19.4"])
    const variables = JSON.stringify([
      {
        id: "var-1",
        name: "Server Jar File",
        key: "SERVER_JARFILE",
        value: "server.jar",
        defaultValue: "server.jar",
        description: "The primary executable JAR file for the Minecraft server.",
        required: true,
        editable: true,
        rules: "required|string",
      },
      {
        id: "var-2",
        name: "Paper Build",
        key: "BUILD_NUMBER",
        value: "latest",
        defaultValue: "latest",
        description: "The build version of Paper to download and execute.",
        required: false,
        editable: true,
        rules: "nullable|string",
      },
    ])

    db.prepare(`
      INSERT INTO eggs (id, name, description, category, author, docker_image, startup_command, stop_command, supported_versions, variables)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "paper-mc",
      "Paper Minecraft",
      "High-performance Minecraft: Java Edition server software based on Spigot.",
      "Minecraft",
      "KineticHost",
      "ghcr.io/pterodactyl/yolks:java_21",
      "java -Xms128M -XX:MaxRAMPercentage=95.0 -jar {{SERVER_JARFILE}}",
      "stop",
      supportedVersions,
      variables
    )
    console.log("[Seed] Default egg seeded: Paper Minecraft")
  }

  // 3. Seed Default Local Node
  const existingNode = db.prepare("SELECT * FROM nodes WHERE id = ?").get("node-local")
  if (!existingNode) {
    db.prepare(`
      INSERT INTO nodes (id, name, description, location_id, location, fqdn, scheme, status, memory, disk, daemon_listen, daemon_sftp)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'offline', 8192, 51200, 8080, 2022)
    `).run(
      "node-local",
      "Local Node 01",
      "Default local infrastructure node",
      "loc-local",
      "Localhost",
      "127.0.0.1",
      "http"
    )
    console.log("[Seed] Default node seeded: Local Node 01")
  }

  // 4. Seed Default Allocations
  const allocationCount = (db.prepare("SELECT COUNT(*) as count FROM allocations WHERE node_id = ?").get("node-local") as any).count
  if (allocationCount === 0) {
    const insertAlloc = db.prepare(`
      INSERT INTO allocations (id, node_id, ip, port, assigned, is_primary)
      VALUES (?, 'node-local', '127.0.0.1', ?, 0, 0)
    `)
    const ports = [25565, 25566, 25567, 25568, 25569]
    for (const port of ports) {
      insertAlloc.run(crypto.randomUUID(), port)
    }
    console.log(`[Seed] Seeded ${ports.length} default allocations for node-local`)
  }

  // 5. Seed Admin Settings
  const defaultSettings: Record<string, any> = {
    general: {
      brandName: "KineticHost",
      supportUrl: "https://discord.gg/kinetichost",
      discordUrl: "https://discord.gg/kinetichost",
      documentationUrl: "https://docs.kinetic.host",
      dashboardUrl: "http://localhost:3000",
    },
    hosting: {
      maxServersPerUser: 3,
      defaultMemory: 2048,
      defaultCpu: 100,
      defaultDisk: 5120,
      defaultDatabases: 2,
      defaultBackups: 2,
      defaultAllocations: 1,
    },
    registration: {
      enabled: true,
      emailVerification: false,
      requireInvite: false,
    },
    security: {
      sessionLifetime: 10080, // 7 days in minutes
      requirePasswordChange: 0,
      require2fa: false,
      minPasswordLength: 8,
    },
    infrastructure: {
      maintenanceMode: false,
      maintenanceMessage: "The platform is currently undergoing scheduled maintenance.",
    },
  }

  for (const [key, value] of Object.entries(defaultSettings)) {
    const existing = db.prepare("SELECT key FROM admin_settings WHERE key = ?").get(key)
    if (!existing) {
      db.prepare("INSERT INTO admin_settings (key, value) VALUES (?, ?)").run(key, JSON.stringify(value))
    }
  }
}
