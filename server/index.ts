import { config } from "./config.js"
import { initializeSchema } from "./db/schema.js"
import { seedDatabase } from "./db/seed.js"
import { app } from "./app.js"

try {
  console.log("[KineticHost] Initializing database schema...")
  initializeSchema()

  console.log("[KineticHost] Seeding system records...")
  seedDatabase()

  app.listen(config.port, "0.0.0.0", () => {
    console.log(`[KineticHost] Server running at http://0.0.0.0:${config.port}`)
    console.log(`[KineticHost] Environment: ${config.nodeEnv}`)
    console.log(`[KineticHost] Default Admin: ${config.admin.email}`)
  })
} catch (err) {
  console.error("[KineticHost] Fatal error during startup:", err)
  process.exit(1)
}
