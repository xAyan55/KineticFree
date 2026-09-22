// ============================================================
// KineticHost — API Service Index
// Exports mock or real API depending on environment
// ============================================================

// For now, we always use the mock API. When a real backend exists,
// this file becomes the single point to swap implementations.
//
// Usage: import { auth, servers, files, ... } from "@/lib/api"
//
// To switch to real API, create real implementations in each
// service file and conditionally export based on VITE_USE_MOCK_API.

export {
  mockAuth as auth,
  mockServerApi as servers,
  mockFileApi as files,
  mockBackupApi as backups,
  mockDatabaseApi as databases,
  mockScheduleApi as schedules,
  mockNodeApi as nodes,
  mockAllocationApi as allocations,
  mockEggApi as eggs,
  mockUserApi as users,
  mockAccountApi as account,
  mockStartupApi as startup,
  mockSubuserApi as subusers,
  mockAdminApi as admin,
} from "@/lib/mock/handlers"
