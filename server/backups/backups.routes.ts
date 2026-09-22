import crypto from "crypto"
import { Router, Request, Response, NextFunction } from "express"
import { db } from "../db/database.js"
import { serversService } from "../servers/servers.service.js"
import { requireAuth } from "../auth/auth.middleware.js"
import { HttpError } from "../middleware/error-handler.js"

export const backupsRouter = Router({ mergeParams: true })
backupsRouter.use(requireAuth)

// GET /api/servers/:id/backups
backupsRouter.get("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    serversService.getById(serverId, req.user!)

    const backups = db
      .prepare(`
        SELECT id, server_id as serverId, name, bytes as size, checksum, status,
               created_at as createdAt, completed_at as completedAt
        FROM backups WHERE server_id = ?
        ORDER BY created_at DESC
      `)
      .all(serverId)

    res.json(backups)
  } catch (err) {
    next(err)
  }
})

// POST /api/servers/:id/backups
backupsRouter.post("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    const server = serversService.getById(serverId, req.user!)

    const existingCount = (
      db.prepare("SELECT COUNT(*) as count FROM backups WHERE server_id = ?").get(serverId) as any
    ).count

    if (existingCount >= server.featureLimits.backups) {
      throw new HttpError(
        400,
        "LIMIT_REACHED",
        `Backup limit reached. This server can only store up to ${server.featureLimits.backups} backups.`
      )
    }

    const { name } = req.body || {}
    const backupName = (name && typeof name === "string") ? name.trim() : `backup-${new Date().toISOString().slice(0, 10)}`
    const backupId = crypto.randomUUID()

    db.prepare(`
      INSERT INTO backups (id, server_id, name, bytes, is_successful, status, created_at)
      VALUES (?, ?, ?, 0, 0, 'queued', datetime('now'))
    `).run(backupId, serverId, backupName)

    res.status(201).json({
      id: backupId,
      serverId,
      name: backupName,
      size: 0,
      checksum: null,
      status: "queued",
      createdAt: new Date().toISOString(),
      completedAt: null,
    })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/servers/:id/backups/:backupId
backupsRouter.delete("/:backupId", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    const backupId = String(req.params.backupId)
    serversService.getById(serverId, req.user!)

    const result = db.prepare("DELETE FROM backups WHERE id = ? AND server_id = ?").run(backupId, serverId)
    if (result.changes === 0) {
      throw new HttpError(404, "BACKUP_NOT_FOUND", "Backup not found.")
    }

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// GET /api/servers/:id/backups/:backupId/download
backupsRouter.get("/:backupId/download", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    const backupId = String(req.params.backupId)
    serversService.getById(serverId, req.user!)

    const backup = db.prepare("SELECT * FROM backups WHERE id = ? AND server_id = ?").get(backupId, serverId) as any
    if (!backup) {
      throw new HttpError(404, "BACKUP_NOT_FOUND", "Backup not found.")
    }

    if (backup.status !== "completed") {
      throw new HttpError(400, "BACKUP_NOT_READY", "Backup is still processing or has failed.")
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    res.json({
      downloadUrl: `/api/servers/${serverId}/backups/${backupId}/archive`,
      expiresAt,
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/servers/:id/backups/:backupId/restore
backupsRouter.post("/:backupId/restore", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    const backupId = String(req.params.backupId)
    serversService.getById(serverId, req.user!)

    const backup = db.prepare("SELECT * FROM backups WHERE id = ? AND server_id = ?").get(backupId, serverId)
    if (!backup) {
      throw new HttpError(404, "BACKUP_NOT_FOUND", "Backup not found.")
    }

    res.json({
      accepted: true,
      operationId: crypto.randomUUID(),
    })
  } catch (err) {
    next(err)
  }
})
