// ============================================================
// KineticHost — API Service Index
// Exports real API service modules using ApiClient
// ============================================================

// All services communicate with the backend via ApiClient.
// No mock handlers are imported or used in production.

export { authApi as auth } from "./auth"
export { serverApi as servers } from "./servers"
export { fileApi as files } from "./files"
export { backupApi as backups } from "./backups"
export { databaseApi as databases } from "./databases"
export { scheduleApi as schedules } from "./schedules"
export { nodeApi as nodes } from "./nodes"
export { allocationApi as allocations } from "./allocations"
export { eggApi as eggs } from "./eggs"
export { userApi as users } from "./users"
export { accountApi as account } from "./account"
export { startupApi as startup } from "./startup"
export { subuserApi as subusers } from "./subusers"
export { adminApi as admin } from "./admin"

// Re-export the client for direct use if needed
export { apiClient } from "./client"
