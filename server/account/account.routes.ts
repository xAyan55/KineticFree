import crypto from "crypto"
import bcrypt from "bcryptjs"
import { Router, Request, Response, NextFunction } from "express"
import { db } from "../db/database.js"
import { formatAuthUser, authService, UserRow } from "../auth/auth.service.js"
import { requireAuth } from "../auth/auth.middleware.js"
import { HttpError } from "../middleware/error-handler.js"

export const accountRouter = Router()
accountRouter.use(requireAuth)

// PATCH /api/account/profile
accountRouter.patch("/profile", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email } = req.body || {}
    const updates: string[] = []
    const values: any[] = []

    if (name && typeof name === "string") {
      updates.push("name = ?")
      values.push(name.trim())
    }

    if (email && typeof email === "string") {
      const cleanEmail = email.trim().toLowerCase()
      const existing = db
        .prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?")
        .get(cleanEmail, req.user!.id)
      if (existing) {
        throw new HttpError(409, "EMAIL_EXISTS", "This email address is already in use.")
      }
      updates.push("email = ?")
      values.push(cleanEmail)
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')")
      values.push(req.user!.id)
      db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values)
    }

    const updatedUser = authService.findUserById(req.user!.id) as UserRow
    res.json(formatAuthUser(updatedUser))
  } catch (err) {
    next(err)
  }
})

// POST /api/account/password
accountRouter.post("/password", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body || {}
    if (!currentPassword || !newPassword) {
      throw new HttpError(400, "BAD_REQUEST", "Current password and new password are required.")
    }

    const matches = await bcrypt.compare(currentPassword, req.user!.password_hash)
    if (!matches) {
      throw new HttpError(400, "INVALID_PASSWORD", "The current password provided is incorrect.")
    }

    if (newPassword.length < 8) {
      throw new HttpError(400, "WEAK_PASSWORD", "New password must be at least 8 characters long.")
    }

    const hash = await bcrypt.hash(newPassword, 10)
    db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(hash, req.user!.id)

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// GET /api/account/sessions
accountRouter.get("/sessions", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const rows = db
      .prepare(`
        SELECT id, ip_address as ip, user_agent, created_at as createdAt, expires_at
        FROM sessions WHERE user_id = ?
        ORDER BY created_at DESC
      `)
      .all(req.user!.id) as any[]

    const currentSessionId = req.session?.id
    const sessions = rows.map((s) => ({
      id: s.id,
      ip: s.ip || "127.0.0.1",
      browser: s.user_agent ? s.user_agent.substring(0, 30) : "Browser",
      os: "Unknown OS",
      lastActive: s.createdAt,
      current: s.id === currentSessionId,
      createdAt: s.createdAt,
    }))

    res.json(sessions)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/account/sessions/:id
accountRouter.delete("/sessions/:id", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { id } = req.params
    db.prepare("DELETE FROM sessions WHERE id = ? AND user_id = ?").run(id, req.user!.id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// POST /api/account/sessions/revoke-all
accountRouter.post("/sessions/revoke-all", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const currentSessionId = req.session?.id
    if (currentSessionId) {
      db.prepare("DELETE FROM sessions WHERE user_id = ? AND id != ?").run(req.user!.id, currentSessionId)
    } else {
      db.prepare("DELETE FROM sessions WHERE user_id = ?").run(req.user!.id)
    }
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// GET /api/account/api-keys
accountRouter.get("/api-keys", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const rows = db
      .prepare(`
        SELECT id, identifier, description, last_used_at as lastUsedAt, created_at as createdAt
        FROM api_keys WHERE user_id = ?
        ORDER BY created_at DESC
      `)
      .all(req.user!.id)

    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// POST /api/account/api-keys
accountRouter.post("/api-keys", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { description } = req.body || {}
    const id = crypto.randomUUID()
    const identifier = `kh_${crypto.randomBytes(8).toString("hex")}`
    const secret = `kh_sec_${crypto.randomBytes(24).toString("hex")}`
    const tokenHash = await bcrypt.hash(secret, 10)

    db.prepare(`
      INSERT INTO api_keys (id, user_id, identifier, token_hash, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.user!.id, identifier, tokenHash, description || "API Key")

    res.status(201).json({
      id,
      identifier,
      description: description || "API Key",
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      secret, // Returned ONCE
    })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/account/api-keys/:id
accountRouter.delete("/api-keys/:id", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { id } = req.params
    db.prepare("DELETE FROM api_keys WHERE id = ? AND user_id = ?").run(id, req.user!.id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// POST /api/account/2fa/enable
accountRouter.post("/2fa/enable", (req: Request, res: Response): void => {
  const secret = crypto.randomBytes(20).toString("hex")
  res.json({
    secret,
    qrUri: `otpauth://totp/KineticHost:${encodeURIComponent(req.user!.email)}?secret=${secret}&issuer=KineticHost`,
  })
})

// POST /api/account/2fa/confirm
accountRouter.post("/2fa/confirm", (req: Request, res: Response): void => {
  const recoveryCodes = [
    crypto.randomBytes(4).toString("hex"),
    crypto.randomBytes(4).toString("hex"),
    crypto.randomBytes(4).toString("hex"),
    crypto.randomBytes(4).toString("hex"),
  ]
  db.prepare("UPDATE users SET two_factor_enabled = 1 WHERE id = ?").run(req.user!.id)
  res.json({ recoveryCodes })
})

// POST /api/account/2fa/disable
accountRouter.post("/2fa/disable", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { password } = req.body || {}
    if (!password) {
      throw new HttpError(400, "BAD_REQUEST", "Password confirmation required.")
    }
    const matches = await bcrypt.compare(password, req.user!.password_hash)
    if (!matches) {
      throw new HttpError(400, "INVALID_PASSWORD", "Incorrect password.")
    }
    db.prepare("UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL WHERE id = ?").run(req.user!.id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
