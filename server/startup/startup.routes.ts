import { Router, Request, Response, NextFunction } from "express"
import { db } from "../db/database.js"
import { serversService } from "../servers/servers.service.js"
import { requireAuth } from "../auth/auth.middleware.js"
import { HttpError } from "../middleware/error-handler.js"

export const startupRouter = Router({ mergeParams: true })
startupRouter.use(requireAuth)

// GET /api/servers/:id/startup
startupRouter.get("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    serversService.getById(serverId, req.user!)

    const server = db.prepare("SELECT * FROM servers WHERE id = ?").get(serverId) as any
    const egg = db.prepare("SELECT * FROM eggs WHERE id = ?").get(server.egg_id || "") as any

    let variables: any[] = []
    if (egg && egg.variables) {
      try {
        variables = JSON.parse(egg.variables)
      } catch {
        variables = []
      }
    }

    let env: Record<string, string> = {}
    if (server.environment) {
      try {
        env = JSON.parse(server.environment)
      } catch {
        env = {}
      }
    }

    res.json({
      startup: server.startup || (egg ? egg.startup_command : "java -jar server.jar"),
      dockerImage: server.docker_image || (egg ? egg.docker_image : "ghcr.io/pterodactyl/yolks:java_21"),
      environment: env,
      variables,
    })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/servers/:id/startup
startupRouter.patch("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    serversService.getById(serverId, req.user!)

    const { startup, dockerImage, environment } = req.body || {}
    const updates: string[] = []
    const values: any[] = []

    if (startup !== undefined) {
      updates.push("startup = ?")
      values.push(startup)
    }
    if (dockerImage !== undefined) {
      updates.push("docker_image = ?")
      values.push(dockerImage)
    }
    if (environment !== undefined) {
      updates.push("environment = ?")
      values.push(JSON.stringify(environment))
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')")
      values.push(serverId)
      db.prepare(`UPDATE servers SET ${updates.join(", ")} WHERE id = ?`).run(...values)
    }

    const server = db.prepare("SELECT * FROM servers WHERE id = ?").get(serverId) as any
    const egg = db.prepare("SELECT * FROM eggs WHERE id = ?").get(server.egg_id || "") as any

    let variables: any[] = []
    if (egg && egg.variables) {
      try {
        variables = JSON.parse(egg.variables)
      } catch {
        variables = []
      }
    }

    let env: Record<string, string> = {}
    if (server.environment) {
      try {
        env = JSON.parse(server.environment)
      } catch {
        env = {}
      }
    }

    res.json({
      startup: server.startup || (egg ? egg.startup_command : ""),
      dockerImage: server.docker_image || (egg ? egg.docker_image : ""),
      environment: env,
      variables,
    })
  } catch (err) {
    next(err)
  }
})
