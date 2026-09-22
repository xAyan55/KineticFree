import fs from "fs"
import path from "path"
import crypto from "crypto"
import { Router, Request, Response, NextFunction } from "express"
import { serversService } from "../servers/servers.service.js"
import { requireAuth } from "../auth/auth.middleware.js"
import { HttpError } from "../middleware/error-handler.js"

export const filesRouter = Router({ mergeParams: true })
filesRouter.use(requireAuth)

function getServerFilesDir(serverId: string): string {
  const dir = path.resolve(process.cwd(), "data", "servers", serverId, "files")
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    const defaultProps = path.join(dir, "server.properties")
    if (!fs.existsSync(defaultProps)) {
      fs.writeFileSync(
        defaultProps,
        "# KineticHost Minecraft Server Configuration\nserver-port=25565\nmotd=A KineticHost Minecraft Server\nmax-players=20\n",
        "utf-8"
      )
    }
  }
  return dir
}

function resolveSafePath(baseDir: string, relativePath: string): string {
  const safeRelative = (relativePath || "/").replace(/^[\\/]+/, "")
  const resolved = path.resolve(baseDir, safeRelative)
  if (!resolved.startsWith(baseDir)) {
    throw new HttpError(403, "PATH_TRAVERSAL_DETECTED", "Access denied: outside server root directory.")
  }
  return resolved
}

// GET /api/servers/:id/files?directory=
filesRouter.get("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    serversService.getById(serverId, req.user!)

    const baseDir = getServerFilesDir(serverId)
    const targetDir = resolveSafePath(baseDir, (req.query.directory as string) || "/")

    if (!fs.existsSync(targetDir)) {
      throw new HttpError(404, "DIRECTORY_NOT_FOUND", "Specified directory does not exist.")
    }

    const entries = fs.readdirSync(targetDir, { withFileTypes: true })
    const fileEntries = entries.map((dirent) => {
      const fullPath = path.join(targetDir, dirent.name)
      let stat: fs.Stats | null = null
      try {
        stat = fs.statSync(fullPath)
      } catch {
        // ignore
      }

      const isFile = dirent.isFile()
      const ext = path.extname(dirent.name).toLowerCase()
      const textExtensions = [
        ".txt", ".json", ".yml", ".yaml", ".properties", ".cfg", ".conf",
        ".sh", ".bat", ".log", ".xml", ".toml", ".env", ".md",
      ]
      const isEditable = isFile && textExtensions.includes(ext)

      return {
        name: dirent.name,
        isFile,
        isSymlink: dirent.isSymbolicLink(),
        isEditable,
        mimetype: isFile ? "text/plain" : "inode/directory",
        size: stat ? stat.size : 0,
        modifiedAt: stat ? stat.mtime.toISOString() : new Date().toISOString(),
        mode: stat ? (stat.mode & 0o777).toString(8) : "644",
      }
    })

    res.json(fileEntries)
  } catch (err) {
    next(err)
  }
})

// GET /api/servers/:id/files/content?path=
filesRouter.get("/content", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    serversService.getById(serverId, req.user!)

    const filePath = req.query.path as string
    if (!filePath) {
      throw new HttpError(400, "BAD_REQUEST", "Path parameter is required.")
    }

    const baseDir = getServerFilesDir(serverId)
    const targetPath = resolveSafePath(baseDir, filePath)

    if (!fs.existsSync(targetPath) || !fs.statSync(targetPath).isFile()) {
      throw new HttpError(404, "FILE_NOT_FOUND", "File not found.")
    }

    const content = fs.readFileSync(targetPath, "utf-8")
    const stat = fs.statSync(targetPath)
    const etag = crypto.createHash("md5").update(content).digest("hex")

    res.json({
      content,
      etag,
      modifiedAt: stat.mtime.toISOString(),
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/servers/:id/files/content
filesRouter.post("/content", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    serversService.getById(serverId, req.user!)

    const { path: filePath, content, etag } = req.body || {}
    if (!filePath || content === undefined) {
      throw new HttpError(400, "BAD_REQUEST", "File path and content are required.")
    }

    const baseDir = getServerFilesDir(serverId)
    const targetPath = resolveSafePath(baseDir, filePath)

    if (fs.existsSync(targetPath) && etag) {
      const existingContent = fs.readFileSync(targetPath, "utf-8")
      const currentEtag = crypto.createHash("md5").update(existingContent).digest("hex")
      if (currentEtag !== etag) {
        throw new HttpError(412, "PRECONDITION_FAILED", "File has been modified by another process. Please reload.")
      }
    }

    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.writeFileSync(targetPath, content, "utf-8")

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// POST /api/servers/:id/files/create
filesRouter.post("/create", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    serversService.getById(serverId, req.user!)

    const { path: filePath } = req.body || {}
    if (!filePath) {
      throw new HttpError(400, "BAD_REQUEST", "File path is required.")
    }

    const baseDir = getServerFilesDir(serverId)
    const targetPath = resolveSafePath(baseDir, filePath)

    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    if (!fs.existsSync(targetPath)) {
      fs.writeFileSync(targetPath, "", "utf-8")
    }

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// POST /api/servers/:id/files/directory
filesRouter.post("/directory", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    serversService.getById(serverId, req.user!)

    const { path: dirPath } = req.body || {}
    if (!dirPath) {
      throw new HttpError(400, "BAD_REQUEST", "Directory path is required.")
    }

    const baseDir = getServerFilesDir(serverId)
    const targetPath = resolveSafePath(baseDir, dirPath)

    fs.mkdirSync(targetPath, { recursive: true })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// DELETE /api/servers/:id/files
filesRouter.delete("/", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    serversService.getById(serverId, req.user!)

    const target = req.query.path as string
    if (!target) {
      throw new HttpError(400, "BAD_REQUEST", "Path parameter is required.")
    }

    const baseDir = getServerFilesDir(serverId)
    const targetPath = resolveSafePath(baseDir, target)

    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true })
    }

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// POST /api/servers/:id/files/delete (batch or body support)
filesRouter.post("/delete", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    serversService.getById(serverId, req.user!)

    const { paths } = req.body || {}
    if (!Array.isArray(paths)) {
      throw new HttpError(400, "BAD_REQUEST", "Paths array is required.")
    }

    const baseDir = getServerFilesDir(serverId)
    for (const p of paths) {
      const targetPath = resolveSafePath(baseDir, p)
      if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true })
      }
    }

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// POST /api/servers/:id/files/rename
filesRouter.post("/rename", (req: Request, res: Response, next: NextFunction): void => {
  try {
    const serverId = String(req.params.id)
    serversService.getById(serverId, req.user!)

    const { from, to } = req.body || {}
    if (!from || !to) {
      throw new HttpError(400, "BAD_REQUEST", "From and to paths are required.")
    }

    const baseDir = getServerFilesDir(serverId)
    const fromPath = resolveSafePath(baseDir, from)
    const toPath = resolveSafePath(baseDir, to)

    if (!fs.existsSync(fromPath)) {
      throw new HttpError(404, "FILE_NOT_FOUND", "Source path does not exist.")
    }

    fs.renameSync(fromPath, toPath)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})
