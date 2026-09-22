import { Router, Request, Response, NextFunction } from "express"
import { adminService } from "./admin.service.js"
import { requireAdmin } from "../auth/auth.middleware.js"

export const adminRouter = Router()

// All admin routes require authenticated admin
adminRouter.use(requireAdmin)

// Stats
adminRouter.get("/stats", (_req: Request, res: Response): void => {
  res.json(adminService.getStats())
})

// Settings
adminRouter.get("/settings", (_req: Request, res: Response): void => {
  res.json(adminService.getSettings())
})

adminRouter.patch("/settings", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const updated = adminService.updateSettings(req.body || {})
    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// Audit Logs
adminRouter.get("/audit-logs", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const logs = adminService.getAuditLogs({
      page: req.query.page ? Number(req.query.page) : undefined,
      perPage: req.query.perPage ? Number(req.query.perPage) : undefined,
      search: req.query.search as string,
    })
    res.json(logs)
  } catch (err) {
    next(err)
  }
})

// Admin Servers
adminRouter.get("/servers", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const result = adminService.getServers({
      page: req.query.page ? Number(req.query.page) : undefined,
      perPage: req.query.perPage ? Number(req.query.perPage) : undefined,
      search: req.query.search as string,
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
})

adminRouter.post("/servers/:id/suspend", (req: Request, res: Response, next: NextFunction): void => {
  try {
    adminService.suspendServer(String(req.params.id))
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

adminRouter.post("/servers/:id/unsuspend", (req: Request, res: Response, next: NextFunction): void => {
  try {
    adminService.unsuspendServer(String(req.params.id))
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// Users
adminRouter.get("/users", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const result = adminService.getUsers({
      page: req.query.page ? Number(req.query.page) : undefined,
      perPage: req.query.perPage ? Number(req.query.perPage) : undefined,
      search: req.query.search as string,
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
})

adminRouter.get("/users/:id", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = adminService.getUser(String(req.params.id))
    res.json(user)
  } catch (err) {
    next(err)
  }
})

adminRouter.patch("/users/:id", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const user = adminService.updateUser(String(req.params.id), req.body)
    res.json(user)
  } catch (err) {
    next(err)
  }
})

adminRouter.post("/users/:id/suspend", (req: Request, res: Response, next: NextFunction): void => {
  try {
    adminService.suspendUser(String(req.params.id))
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

adminRouter.post("/users/:id/unsuspend", (req: Request, res: Response, next: NextFunction): void => {
  try {
    adminService.unsuspendUser(String(req.params.id))
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

adminRouter.delete("/users/:id", (req: Request, res: Response, next: NextFunction): void => {
  try {
    adminService.deleteUser(String(req.params.id))
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// Nodes
adminRouter.get("/nodes", (_req: Request, res: Response, next: NextFunction): void => {
  try {
    res.json(adminService.getNodes())
  } catch (err) {
    next(err)
  }
})

adminRouter.get("/nodes/:id", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const node = adminService.getNode(String(req.params.id))
    res.json(node)
  } catch (err) {
    next(err)
  }
})

adminRouter.post("/nodes", (req: Request, res: Response, next: NextFunction): void => {
  try {
    res.status(201).json(adminService.createNode(req.body))
  } catch (err) {
    next(err)
  }
})

adminRouter.patch("/nodes/:id", (req: Request, res: Response, next: NextFunction): void => {
  try {
    res.json(adminService.updateNode(String(req.params.id), req.body))
  } catch (err) {
    next(err)
  }
})

adminRouter.delete("/nodes/:id", (req: Request, res: Response, next: NextFunction): void => {
  try {
    adminService.deleteNode(String(req.params.id))
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// Allocations
adminRouter.get("/allocations", (req: Request, res: Response, next: NextFunction): void => {
  try {
    res.json(
      adminService.getAllocations({
        page: req.query.page ? Number(req.query.page) : undefined,
        perPage: req.query.perPage ? Number(req.query.perPage) : undefined,
      })
    )
  } catch (err) {
    next(err)
  }
})

adminRouter.post("/allocations", (req: Request, res: Response, next: NextFunction): void => {
  try {
    res.status(201).json(adminService.createAllocation(req.body))
  } catch (err) {
    next(err)
  }
})

adminRouter.delete("/allocations/:id", (req: Request, res: Response, next: NextFunction): void => {
  try {
    adminService.deleteAllocation(String(req.params.id))
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// Eggs
adminRouter.get("/eggs", (_req: Request, res: Response, next: NextFunction): void => {
  try {
    res.json(adminService.getEggs())
  } catch (err) {
    next(err)
  }
})

adminRouter.get("/eggs/:id", (req: Request, res: Response, next: NextFunction): void => {
  try {
    res.json(adminService.getEgg(String(req.params.id)))
  } catch (err) {
    next(err)
  }
})

adminRouter.post("/eggs", (req: Request, res: Response, next: NextFunction): void => {
  try {
    res.status(201).json(adminService.createEgg(req.body))
  } catch (err) {
    next(err)
  }
})

adminRouter.patch("/eggs/:id", (req: Request, res: Response, next: NextFunction): void => {
  try {
    res.json(adminService.updateEgg(String(req.params.id), req.body))
  } catch (err) {
    next(err)
  }
})

adminRouter.delete("/eggs/:id", (req: Request, res: Response, next: NextFunction): void => {
  try {
    adminService.deleteEgg(String(req.params.id))
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
