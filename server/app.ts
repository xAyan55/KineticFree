import fs from "fs"
import path from "path"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { authRouter } from "./auth/auth.routes.js"
import { accountRouter } from "./account/account.routes.js"
import { serversRouter } from "./servers/servers.routes.js"
import { adminRouter } from "./admin/admin.routes.js"
import { authenticate } from "./auth/auth.middleware.js"
import { errorHandler } from "./middleware/error-handler.js"

export const app = express()

// Basic security and parsing middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local and configured origins, or allow-all reflection in non-strict setups
      callback(null, true)
    },
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Attach session/user if session cookie is present
app.use(authenticate)

// API routes
app.use("/api/auth", authRouter)
app.use("/api/account", accountRouter)
app.use("/api/servers", serversRouter)
app.use("/api/admin", adminRouter)

// Any unmatched /api route returns JSON 404
app.use("/api", (_req, res) => {
  res.status(404).json({
    status: 404,
    code: "NOT_FOUND",
    message: "The requested API endpoint does not exist.",
  })
})

// Error handler for API routes
app.use(errorHandler)

// Serve Vite frontend build in production
const distDir = path.resolve(process.cwd(), "dist")
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
}

// Catch-all SPA handler for client-side routing (non-API GET requests)
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return next()
  }
  if (req.path.startsWith("/api/")) {
    return next()
  }

  const indexPath = path.join(distDir, "index.html")
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>KineticHost Backend Running</title></head>
        <body style="font-family: sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc;">
          <h2>KineticHost API Server Active</h2>
          <p>Frontend bundle not yet built. Run <code>npm run build</code> to generate the client.</p>
        </body>
      </html>
    `)
  }
})
