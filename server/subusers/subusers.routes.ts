import crypto from "crypto"
import { Router, Request, Response, NextFunction } from "express"
import { db } from "../db/database.js"
import { serversService } from "../servers/servers.service.js"
import { requireAuth } from "../auth/auth.middleware.js"
import { HttpError } from "../middleware/error-handler.js"

export const subusersRouter = Router({ mergeParams: true })
subusersRouter.use(requireAuth)

// GET /api/servers/:id/subusers
subusersRouter.get("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    serversService.getById(serverId, req.user!)

    const rows = db
      .prepare(`
        SELECT su.id, su.user_id as userId, su.permissions, su.created_at as createdAt,
               u.name as userName, u.email as userEmail
        FROM server_subusers su
        JOIN users u ON u.id = su.user_id
        WHERE su.server_id = ?
        ORDER BY su.created_at DESC
      `)
      .all(serverId) as any[]

    const subusers = rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.userName,
      userEmail: r.userEmail,
      permissions: JSON.parse(r.permissions || "[]"),
      createdAt: r.createdAt,
    }))

    res.json(subusers)
  } catch (err) {
    next(err)
  }
})

// POST /api/servers/:id/subusers
subusersRouter.post("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    const server = serversService.getById(serverId, req.user!)

    if (req.user!.role !== "admin" && server.ownerId !== req.user!.id) {
      throw new HttpError(403, "FORBIDDEN", "Only server owners or admins can manage subusers.")
    }

    const { email, permissions = [] } = req.body || {}
    if (!email) {
      throw new HttpError(400, "BAD_REQUEST", "User email is required.")
    }

    const targetUser = db.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)").get(email.trim()) as any
    if (!targetUser) {
      throw new HttpError(404, "USER_NOT_FOUND", "No user found with the specified email address.")
    }

    if (targetUser.id === server.ownerId) {
      throw new HttpError(400, "INVALID_SUBUSER", "Server owner cannot be added as a subuser.")
    }

    const existing = db
      .prepare("SELECT id FROM server_subusers WHERE server_id = ? AND user_id = ?")
      .get(serverId, targetUser.id)
    if (existing) {
      throw new HttpError(409, "SUBUSER_EXISTS", "This user is already a subuser on this server.")
    }

    const subuserId = crypto.randomUUID()
    db.prepare(`
      INSERT INTO server_subusers (id, server_id, user_id, permissions)
      VALUES (?, ?, ?, ?)
    `).run(subuserId, serverId, targetUser.id, JSON.stringify(permissions))

    res.status(201).json({
      id: subuserId,
      userId: targetUser.id,
      userName: targetUser.name,
      userEmail: targetUser.email,
      permissions,
      createdAt: new Date().toISOString(),
    })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/servers/:id/subusers/:subuserId
subusersRouter.patch("/:subuserId", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    const subuserId = String(req.params.subuserId)
    const server = serversService.getById(serverId, req.user!)

    if (req.user!.role !== "admin" && server.ownerId !== req.user!.id) {
      throw new HttpError(403, "FORBIDDEN", "Only server owners or admins can manage subusers.")
    }

    const { permissions = [] } = req.body || {}
    const result = db
      .prepare("UPDATE server_subusers SET permissions = ? WHERE id = ? AND server_id = ?")
      .run(JSON.stringify(permissions), subuserId, serverId)

    if (result.changes === 0) {
      throw new HttpError(404, "SUBUSER_NOT_FOUND", "Subuser not found.")
    }

    const row = db
      .prepare(`
        SELECT su.id, su.user_id as userId, su.permissions, su.created_at as createdAt,
               u.name as userName, u.email as userEmail
        FROM server_subusers su
        JOIN users u ON u.id = su.user_id
        WHERE su.id = ?
      `)
      .get(subuserId) as any

    res.json({
      id: row.id,
      userId: row.userId,
      userName: row.userName,
      userEmail: row.userEmail,
      permissions: JSON.parse(row.permissions || "[]"),
      createdAt: row.createdAt,
    })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/servers/:id/subusers/:subuserId
subusersRouter.delete("/:subuserId", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    const subuserId = String(req.params.subuserId)
    const server = serversService.getById(serverId, req.user!)

    if (req.user!.role !== "admin" && server.ownerId !== req.user!.id) {
      throw new HttpError(403, "FORBIDDEN", "Only server owners or admins can manage subusers.")
    }

    const result = db
      .prepare("DELETE FROM server_subusers WHERE id = ? AND server_id = ?")
      .run(subuserId, serverId)

    if (result.changes === 0) {
      throw new HttpError(404, "SUBUSER_NOT_FOUND", "Subuser not found.")
    }

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
