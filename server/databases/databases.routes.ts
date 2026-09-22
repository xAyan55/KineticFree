import crypto from "crypto"
import { Router, Request, Response, NextFunction } from "express"
import { db } from "../db/database.js"
import { serversService } from "../servers/servers.service.js"
import { requireAuth } from "../auth/auth.middleware.js"
import { HttpError } from "../middleware/error-handler.js"

export const databasesRouter = Router({ mergeParams: true })
databasesRouter.use(requireAuth)

// GET /api/servers/:id/databases
databasesRouter.get("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    serversService.getById(serverId, req.user!)

    const databases = db
      .prepare(`
        SELECT id, server_id as serverId, name, username, host, port, max_connections as maxConnections,
               status, created_at as createdAt
        FROM databases WHERE server_id = ?
        ORDER BY created_at DESC
      `)
      .all(serverId)

    res.json(databases)
  } catch (err) {
    next(err)
  }
})

// POST /api/servers/:id/databases
databasesRouter.post("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    const server = serversService.getById(serverId, req.user!)

    const existingCount = (
      db.prepare("SELECT COUNT(*) as count FROM databases WHERE server_id = ?").get(serverId) as any
    ).count

    if (existingCount >= server.featureLimits.databases) {
      throw new HttpError(
        400,
        "LIMIT_REACHED",
        `Database limit reached. This server can only have up to ${server.featureLimits.databases} databases.`
      )
    }

    const { name } = req.body || {}
    if (!name || typeof name !== "string") {
      throw new HttpError(400, "BAD_REQUEST", "Database name is required.")
    }

    const cleanName = name.replace(/[^a-zA-Z0-9_]/g, "").substring(0, 48)
    const dbId = crypto.randomUUID()
    const dbName = `s${server.id.substring(0, 4)}_${cleanName}`
    const dbUser = `u${server.id.substring(0, 4)}_${cleanName.substring(0, 10)}`
    const generatedPassword = crypto.randomBytes(12).toString("hex")

    db.prepare(`
      INSERT INTO databases (id, server_id, name, username, password, host, port, max_connections, status)
      VALUES (?, ?, ?, ?, ?, '127.0.0.1', 3306, 10, 'active')
    `).run(dbId, serverId, dbName, dbUser, generatedPassword)

    res.status(201).json({
      id: dbId,
      serverId,
      name: dbName,
      username: dbUser,
      host: "127.0.0.1",
      port: 3306,
      maxConnections: 10,
      status: "active",
      createdAt: new Date().toISOString(),
      password: generatedPassword, // One-time disclosure
    })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/servers/:id/databases/:dbId
databasesRouter.delete("/:dbId", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    const dbId = String(req.params.dbId)
    serversService.getById(serverId, req.user!)

    const result = db.prepare("DELETE FROM databases WHERE id = ? AND server_id = ?").run(dbId, serverId)
    if (result.changes === 0) {
      throw new HttpError(404, "DATABASE_NOT_FOUND", "Database not found.")
    }

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// POST /api/servers/:id/databases/:dbId/reset-password
databasesRouter.post("/:dbId/reset-password", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    const dbId = String(req.params.dbId)
    serversService.getById(serverId, req.user!)

    const database = db.prepare("SELECT id FROM databases WHERE id = ? AND server_id = ?").get(dbId, serverId)
    if (!database) {
      throw new HttpError(404, "DATABASE_NOT_FOUND", "Database not found.")
    }

    const newPassword = crypto.randomBytes(12).toString("hex")
    db.prepare("UPDATE databases SET password = ? WHERE id = ?").run(newPassword, dbId)

    res.json({ password: newPassword })
  } catch (err) {
    next(err)
  }
})
