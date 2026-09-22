import path from "path"
import dotenv from "dotenv"

dotenv.config()

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "production",
  isProduction: (process.env.NODE_ENV || "production") === "production",
  databasePath: process.env.DATABASE_PATH || path.resolve(process.cwd(), "data", "kinetichost.db"),
  sessionSecret: process.env.SESSION_SECRET || "kinetic-session-secret-change-me",
  cookieName: "kh_session",
  admin: {
    email: process.env.ADMIN_EMAIL || "ayan@kinetic.host",
    password: process.env.ADMIN_PASSWORD || "password123",
    name: process.env.ADMIN_NAME || "Ayan",
  },
}
