import crypto from "crypto"
import bcrypt from "bcryptjs"
import { db } from "../db/database.js"
import { HttpError } from "../middleware/error-handler.js"

export interface UserRow {
  id: string
  email: string
  username: string
  name: string
  password_hash: string
  role: "user" | "admin"
  root_admin: number
  status: "active" | "suspended"
  avatar_url: string | null
  memory_limit: number
  cpu_limit: number
  disk_limit: number
  server_limit: number
  two_factor_secret: string | null
  two_factor_enabled: number
  email_verified: number
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface SessionRow {
  id: string
  user_id: string
  expires_at: string
  user_agent: string | null
  ip_address: string | null
  created_at: string
}

export function formatAuthUser(user: UserRow) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatar_url || undefined,
    createdAt: user.created_at,
    emailVerified: Boolean(user.email_verified),
  }
}

export const authService = {
  findUserByEmail(email: string): UserRow | undefined {
    return db.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)").get(email.trim()) as UserRow | undefined
  },

  findUserById(id: string): UserRow | undefined {
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined
  },

  async validateCredentials(email: string, password: string): Promise<UserRow> {
    const user = this.findUserByEmail(email)
    if (!user) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password.")
    }

    if (user.status === "suspended") {
      throw new HttpError(403, "ACCOUNT_SUSPENDED", "Your account has been suspended. Please contact support.")
    }

    const matches = await bcrypt.compare(password, user.password_hash)
    if (!matches) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password.")
    }

    // Update last login timestamp
    db.prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?").run(user.id)

    return user
  },

  createSession(userId: string, userAgent?: string, ipAddress?: string): { sessionId: string; expiresAt: Date } {
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    db.prepare(`
      INSERT INTO sessions (id, user_id, expires_at, user_agent, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionId, userId, expiresAt.toISOString(), userAgent || null, ipAddress || null)

    return { sessionId, expiresAt }
  },

  getSession(sessionId: string): { user: UserRow; session: SessionRow } | null {
    const session = db.prepare("SELECT * FROM sessions WHERE id = ?").get(sessionId) as SessionRow | undefined
    if (!session) return null

    if (new Date(session.expires_at).getTime() < Date.now()) {
      // Session expired, delete it
      db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId)
      return null
    }

    const user = this.findUserById(session.user_id)
    if (!user || user.status === "suspended") {
      return null
    }

    return { user, session }
  },

  destroySession(sessionId: string): void {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId)
  },

  async registerUser(name: string, email: string, password: string): Promise<UserRow> {
    // Check if registration is enabled
    const regSettingRow = db.prepare("SELECT value FROM admin_settings WHERE key = 'registration'").get() as any
    if (regSettingRow) {
      try {
        const regConfig = JSON.parse(regSettingRow.value)
        if (!regConfig.enabled) {
          throw new HttpError(403, "REGISTRATION_DISABLED", "New account registration is currently disabled.")
        }
      } catch (err: any) {
        if (err instanceof HttpError) throw err
      }
    }

    const trimmedEmail = email.trim().toLowerCase()
    const existing = this.findUserByEmail(trimmedEmail)
    if (existing) {
      throw new HttpError(409, "USER_EXISTS", "An account with this email address already exists.")
    }

    if (password.length < 8) {
      throw new HttpError(400, "WEAK_PASSWORD", "Password must be at least 8 characters long.")
    }

    const userId = crypto.randomUUID()
    const username = name.toLowerCase().replace(/[^a-z0-9]/g, "") + Math.floor(1000 + Math.random() * 9000)
    const passwordHash = await bcrypt.hash(password, 10)

    db.prepare(`
      INSERT INTO users (id, email, username, name, password_hash, role, root_admin, status, email_verified)
      VALUES (?, ?, ?, ?, ?, 'user', 0, 'active', 1)
    `).run(userId, trimmedEmail, username, name.trim(), passwordHash)

    return this.findUserById(userId)!
  },
}
