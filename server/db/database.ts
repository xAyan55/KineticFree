import fs from "fs"
import path from "path"
import Database from "better-sqlite3"
import { config } from "../config.js"

// Ensure data directory exists
const dbDir = path.dirname(config.databasePath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

export const db: Database.Database = new Database(config.databasePath)

// Performance and integrity pragmas
db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")
db.pragma("synchronous = NORMAL")
