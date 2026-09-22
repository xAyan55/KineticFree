import crypto from "crypto"
import { Router, Request, Response, NextFunction } from "express"
import { db } from "../db/database.js"
import { serversService } from "../servers/servers.service.js"
import { requireAuth } from "../auth/auth.middleware.js"
import { HttpError } from "../middleware/error-handler.js"

export const schedulesRouter = Router({ mergeParams: true })
schedulesRouter.use(requireAuth)

function formatSchedule(row: any) {
  const tasks = db
    .prepare(`
      SELECT id, schedule_id as scheduleId, sequence_id as sequenceId,
             action, payload, time_offset as timeOffset
      FROM schedule_tasks
      WHERE schedule_id = ?
      ORDER BY sequence_id ASC
    `)
    .all(row.id)

  return {
    id: row.id,
    serverId: row.server_id,
    name: row.name,
    cron: row.cron,
    isActive: Boolean(row.is_active),
    onlyWhenOnline: Boolean(row.only_when_online),
    lastRunAt: row.last_run_at,
    nextRunAt: row.next_run_at,
    tasks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// GET /api/servers/:id/schedules
schedulesRouter.get("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    serversService.getById(serverId, req.user!)

    const rows = db.prepare("SELECT * FROM schedules WHERE server_id = ? ORDER BY created_at DESC").all(serverId)
    res.json(rows.map(formatSchedule))
  } catch (err) {
    next(err)
  }
})

// POST /api/servers/:id/schedules
schedulesRouter.post("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    serversService.getById(serverId, req.user!)

    const { name, cron, isActive = true, onlyWhenOnline = true } = req.body || {}
    if (!name || typeof name !== "string") {
      throw new HttpError(400, "BAD_REQUEST", "Schedule name is required.")
    }

    const scheduleId = crypto.randomUUID()
    db.prepare(`
      INSERT INTO schedules (id, server_id, name, cron, is_active, only_when_online)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(scheduleId, serverId, name.trim(), cron || "0 0 * * *", isActive ? 1 : 0, onlyWhenOnline ? 1 : 0)

    const row = db.prepare("SELECT * FROM schedules WHERE id = ?").get(scheduleId)
    res.status(201).json(formatSchedule(row))
  } catch (err) {
    next(err)
  }
})

// PATCH /api/servers/:id/schedules/:scheduleId
schedulesRouter.patch("/:scheduleId", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    const scheduleId = String(req.params.scheduleId)
    serversService.getById(serverId, req.user!)

    const schedule = db.prepare("SELECT * FROM schedules WHERE id = ? AND server_id = ?").get(scheduleId, serverId)
    if (!schedule) {
      throw new HttpError(404, "SCHEDULE_NOT_FOUND", "Schedule not found.")
    }

    const { name, cron, isActive, onlyWhenOnline } = req.body || {}
    const updates: string[] = []
    const values: any[] = []

    if (name !== undefined) {
      updates.push("name = ?")
      values.push(name.trim())
    }
    if (cron !== undefined) {
      updates.push("cron = ?")
      values.push(cron)
    }
    if (isActive !== undefined) {
      updates.push("is_active = ?")
      values.push(isActive ? 1 : 0)
    }
    if (onlyWhenOnline !== undefined) {
      updates.push("only_when_online = ?")
      values.push(onlyWhenOnline ? 1 : 0)
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')")
      values.push(scheduleId)
      db.prepare(`UPDATE schedules SET ${updates.join(", ")} WHERE id = ?`).run(...values)
    }

    const row = db.prepare("SELECT * FROM schedules WHERE id = ?").get(scheduleId)
    res.json(formatSchedule(row))
  } catch (err) {
    next(err)
  }
})

// DELETE /api/servers/:id/schedules/:scheduleId
schedulesRouter.delete("/:scheduleId", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    const scheduleId = String(req.params.scheduleId)
    serversService.getById(serverId, req.user!)

    const result = db.prepare("DELETE FROM schedules WHERE id = ? AND server_id = ?").run(scheduleId, serverId)
    if (result.changes === 0) {
      throw new HttpError(404, "SCHEDULE_NOT_FOUND", "Schedule not found.")
    }

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// POST /api/servers/:id/schedules/:scheduleId/tasks
schedulesRouter.post("/:scheduleId/tasks", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    const scheduleId = String(req.params.scheduleId)
    serversService.getById(serverId, req.user!)

    const schedule = db.prepare("SELECT * FROM schedules WHERE id = ? AND server_id = ?").get(scheduleId, serverId)
    if (!schedule) {
      throw new HttpError(404, "SCHEDULE_NOT_FOUND", "Schedule not found.")
    }

    const { action, payload, timeOffset = 0 } = req.body || {}
    if (!action || !["command", "power", "backup"].includes(action)) {
      throw new HttpError(400, "BAD_REQUEST", "Valid task action is required (command, power, backup).")
    }

    const currentCount = (
      db.prepare("SELECT COUNT(*) as count FROM schedule_tasks WHERE schedule_id = ?").get(scheduleId) as any
    ).count

    const taskId = crypto.randomUUID()
    db.prepare(`
      INSERT INTO schedule_tasks (id, schedule_id, sequence_id, action, payload, time_offset)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(taskId, scheduleId, currentCount + 1, action, payload || "", timeOffset)

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// DELETE /api/servers/:id/schedules/:scheduleId/tasks/:taskId
schedulesRouter.delete("/:scheduleId/tasks/:taskId", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    const scheduleId = String(req.params.scheduleId)
    const taskId = String(req.params.taskId)
    serversService.getById(serverId, req.user!)

    const result = db
      .prepare("DELETE FROM schedule_tasks WHERE id = ? AND schedule_id = ?")
      .run(taskId, scheduleId)
    if (result.changes === 0) {
      throw new HttpError(404, "TASK_NOT_FOUND", "Task not found.")
    }

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
