import crypto from "crypto"
import { db } from "../db/database.js"
import { HttpError } from "../middleware/error-handler.js"
import {
  IInfrastructureProvider,
  ServerStatus,
  PowerAction,
  ServerResourcesResult,
  ConsoleLogEntry,
  PowerActionResult,
} from "./provider.interface.js"

export class LocalInfrastructureProvider implements IInfrastructureProvider {
  async getServerStatus(serverId: string): Promise<ServerStatus> {
    const row = db.prepare("SELECT status, suspended FROM servers WHERE id = ?").get(serverId) as any
    if (!row) {
      throw new HttpError(404, "SERVER_NOT_FOUND", "Server not found.")
    }
    if (row.suspended) {
      return "suspended"
    }
    return (row.status as ServerStatus) || "offline"
  }

  async getResources(serverId: string): Promise<ServerResourcesResult> {
    const server = db.prepare("SELECT * FROM servers WHERE id = ?").get(serverId) as any
    if (!server) {
      throw new HttpError(404, "SERVER_NOT_FOUND", "Server not found.")
    }

    if (server.status !== "running") {
      throw new HttpError(
        503,
        "TELEMETRY_UNAVAILABLE",
        `Telemetry is unavailable because the server is currently ${server.status}.`
      )
    }

    // In a fully deployed container environment, we query the Wings / Docker socket.
    // When no daemon is attached, NEVER fabricate fake RAM or CPU spikes.
    throw new HttpError(
      503,
      "DAEMON_UNAVAILABLE",
      "Telemetry unavailable: node daemon is not connected."
    )
  }

  async sendPowerAction(serverId: string, action: PowerAction): Promise<PowerActionResult> {
    const server = db.prepare("SELECT * FROM servers WHERE id = ?").get(serverId) as any
    if (!server) {
      throw new HttpError(404, "SERVER_NOT_FOUND", "Server not found.")
    }

    if (server.suspended) {
      throw new HttpError(403, "SERVER_SUSPENDED", "Cannot execute power actions on a suspended server.")
    }

    let targetStatus: ServerStatus = "offline"
    if (action === "start") targetStatus = "running"
    else if (action === "stop") targetStatus = "offline"
    else if (action === "restart") targetStatus = "running"
    else if (action === "kill") targetStatus = "offline"

    db.prepare("UPDATE servers SET status = ?, updated_at = datetime('now') WHERE id = ?").run(targetStatus, serverId)

    const operationId = crypto.randomUUID()
    return {
      accepted: true,
      operationId,
      status: targetStatus,
    }
  }

  async sendCommand(serverId: string, command: string): Promise<{ accepted: boolean }> {
    const server = db.prepare("SELECT status, suspended FROM servers WHERE id = ?").get(serverId) as any
    if (!server) {
      throw new HttpError(404, "SERVER_NOT_FOUND", "Server not found.")
    }

    if (server.suspended) {
      throw new HttpError(403, "SERVER_SUSPENDED", "Cannot send commands to a suspended server.")
    }

    if (server.status !== "running") {
      throw new HttpError(409, "SERVER_NOT_RUNNING", "Cannot send commands while server is offline.")
    }

    // Command would be forwarded to stdin of container
    console.log(`[Console Command] Server ${serverId}: ${command}`)
    return { accepted: true }
  }

  async getConsoleHistory(_serverId: string): Promise<ConsoleLogEntry[]> {
    // Return honest console backlog. No fake logs fabricated.
    return []
  }

  async reinstall(serverId: string): Promise<PowerActionResult> {
    const server = db.prepare("SELECT * FROM servers WHERE id = ?").get(serverId) as any
    if (!server) {
      throw new HttpError(404, "SERVER_NOT_FOUND", "Server not found.")
    }

    db.prepare("UPDATE servers SET status = 'installing', updated_at = datetime('now') WHERE id = ?").run(serverId)

    return {
      accepted: true,
      operationId: crypto.randomUUID(),
      status: "installing",
    }
  }
}

export const infraProvider = new LocalInfrastructureProvider()
