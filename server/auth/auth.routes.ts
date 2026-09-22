import { Router, Request, Response, NextFunction } from "express"
import { authService, formatAuthUser } from "./auth.service.js"
import { requireAuth } from "./auth.middleware.js"
import { loginRateLimiter } from "../middleware/rate-limit.js"
import { config } from "../config.js"
import { HttpError } from "../middleware/error-handler.js"

export const authRouter = Router()

// POST /api/auth/login
authRouter.post(
  "/login",
  loginRateLimiter(),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body || {}
      if (!email || !password) {
        throw new HttpError(400, "BAD_REQUEST", "Email and password are required.")
      }

      const user = await authService.validateCredentials(email, password)
      const userAgent = req.headers["user-agent"]
      const ip = req.ip || req.socket.remoteAddress

      const { sessionId, expiresAt } = authService.createSession(user.id, userAgent, ip)

      res.cookie(config.cookieName, sessionId, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
      })

      res.json({ user: formatAuthUser(user) })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/auth/register
authRouter.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password } = req.body || {}
      if (!name || !email || !password) {
        throw new HttpError(400, "BAD_REQUEST", "Name, email, and password are required.")
      }

      const user = await authService.registerUser(name, email, password)
      const userAgent = req.headers["user-agent"]
      const ip = req.ip || req.socket.remoteAddress

      const { sessionId, expiresAt } = authService.createSession(user.id, userAgent, ip)

      res.cookie(config.cookieName, sessionId, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
      })

      res.status(201).json({ user: formatAuthUser(user) })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/auth/logout
authRouter.post(
  "/logout",
  (req: Request, res: Response): void => {
    const sessionId = req.cookies?.[config.cookieName]
    if (sessionId) {
      authService.destroySession(sessionId)
    }
    res.clearCookie(config.cookieName, { path: "/" })
    res.json({ success: true })
  }
)

// GET /api/auth/session
authRouter.get(
  "/session",
  requireAuth,
  (req: Request, res: Response): void => {
    res.json({ user: formatAuthUser(req.user!) })
  }
)

// POST /api/auth/forgot-password
authRouter.post(
  "/forgot-password",
  (req: Request, res: Response): void => {
    // For privacy, always return success message without revealing email presence
    res.json({
      success: true,
      message: "If an account exists with this email address, password reset instructions have been dispatched.",
    })
  }
)

// POST /api/auth/reset-password
authRouter.post(
  "/reset-password",
  (req: Request, res: Response, next: NextFunction): void => {
    const { token, password } = req.body || {}
    if (!token || !password) {
      return next(new HttpError(400, "BAD_REQUEST", "Token and new password are required."))
    }
    // Stub token check - in a production mail setup, reset tokens are validated from DB
    return next(new HttpError(400, "INVALID_TOKEN", "The password reset token is invalid or has expired."))
  }
)
