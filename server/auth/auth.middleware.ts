import { Request, Response, NextFunction } from "express"
import { config } from "../config.js"
import { authService, UserRow, SessionRow } from "./auth.service.js"
import { HttpError } from "../middleware/error-handler.js"

declare global {
  namespace Express {
    interface Request {
      user?: UserRow
      session?: SessionRow
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const sessionId = req.cookies?.[config.cookieName]
  if (!sessionId) {
    return next()
  }

  const result = authService.getSession(sessionId)
  if (result) {
    req.user = result.user
    req.session = result.session
  }

  next()
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || !req.session) {
    return next(new HttpError(401, "UNAUTHORIZED", "Authentication is required to access this resource."))
  }
  next()
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || !req.session) {
    return next(new HttpError(401, "UNAUTHORIZED", "Authentication is required to access this resource."))
  }
  if (req.user.role !== "admin") {
    return next(new HttpError(403, "FORBIDDEN", "Administrative privileges are required."))
  }
  next()
}
