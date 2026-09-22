import { Request, Response, NextFunction } from "express"
import { HttpError } from "./error-handler.js"

interface RateLimitRecord {
  count: number
  resetTime: number
}

const loginAttempts = new Map<string, RateLimitRecord>()

// Clean up stale entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of loginAttempts.entries()) {
    if (record.resetTime < now) {
      loginAttempts.delete(key)
    }
  }
}, 10 * 60 * 1000).unref()

export function loginRateLimiter(maxAttempts = 15, windowMs = 15 * 60 * 1000) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || "unknown"
    const now = Date.now()
    const record = loginAttempts.get(ip)

    if (!record || record.resetTime < now) {
      loginAttempts.set(ip, { count: 1, resetTime: now + windowMs })
      return next()
    }

    if (record.count >= maxAttempts) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000)
      return next(
        new HttpError(
          429,
          "TOO_MANY_ATTEMPTS",
          `Too many failed login attempts. Please try again in ${retryAfterSec} seconds.`
        )
      )
    }

    record.count += 1
    next()
  }
}
