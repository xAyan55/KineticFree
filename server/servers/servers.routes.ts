import { Router, Request, Response, NextFunction } from "express"
import { serversService } from "./servers.service.js"
import { infraProvider } from "../infrastructure/local.provider.js"
import { requireAuth } from "../auth/auth.middleware.js"
import { HttpError } from "../middleware/error-handler.js"
import { filesRouter } from "../files/files.routes.js"
import { databasesRouter } from "../databases/databases.routes.js"
import { backupsRouter } from "../backups/backups.routes.js"
import { schedulesRouter } from "../schedules/schedules.routes.js"
import { startupRouter } from "../startup/startup.routes.js"
import { subusersRouter } from "../subusers/subusers.routes.js"

export const serversRouter = Router()

// Sub-resource routers
serversRouter.use("/:id/files", filesRouter)
serversRouter.use("/:id/databases", databasesRouter)
serversRouter.use("/:id/backups", backupsRouter)
serversRouter.use("/:id/schedules", schedulesRouter)
serversRouter.use("/:id/startup", startupRouter)
serversRouter.use("/:id/subusers", subusersRouter)

// All server routes require authentication
serversRouter.use(requireAuth)

// GET /api/servers
serversRouter.get("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const data = serversService.listForUser(req.user!)
    res.json({ data })
  } catch (err) {
    next(err)
  }
})

// GET /api/servers/:id
serversRouter.get("/:id", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = String(req.params.id)
    const server = serversService.getById(id, req.user!)
    res.json(server)
  } catch (err) {
    next(err)
  }
})

// POST /api/servers
serversRouter.post("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const server = serversService.create(req.user!, req.body)
    res.status(201).json(server)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/servers/:id
serversRouter.patch("/:id", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = String(req.params.id)
    const server = serversService.update(id, req.user!, req.body)
    res.json(server)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/servers/:id
serversRouter.delete("/:id", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = String(req.params.id)
    serversService.delete(id, req.user!)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// GET /api/servers/:id/resources
serversRouter.get("/:id/resources", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id)
    serversService.getById(id, req.user!)
    const resources = await infraProvider.getResources(id)
    res.json(resources)
  } catch (err) {
    next(err)
  }
})

// POST /api/servers/:id/power
serversRouter.post("/:id/power", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id)
    serversService.getById(id, req.user!)
    const { action } = req.body || {}
    if (!action || !["start", "stop", "restart", "kill"].includes(action)) {
      throw new HttpError(400, "BAD_REQUEST", "Valid power action is required (start, stop, restart, kill).")
    }

    const result = await infraProvider.sendPowerAction(id, action)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

// POST /api/servers/:id/command
serversRouter.post("/:id/command", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id)
    serversService.getById(id, req.user!)
    const { command } = req.body || {}
    if (typeof command !== "string" || !command.trim()) {
      throw new HttpError(400, "BAD_REQUEST", "Command string is required.")
    }

    const result = await infraProvider.sendCommand(id, command.trim())
    res.json(result)
  } catch (err) {
    next(err)
  }
})

// GET /api/servers/:id/logs
serversRouter.get("/:id/logs", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id)
    serversService.getById(id, req.user!)
    const logs = await infraProvider.getConsoleHistory(id)
    res.json(logs)
  } catch (err) {
    next(err)
  }
})

// POST /api/servers/:id/reinstall
serversRouter.post("/:id/reinstall", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id)
    serversService.getById(id, req.user!)
    const result = await infraProvider.reinstall(id)
    res.json(result)
  } catch (err) {
    next(err)
  }
})
