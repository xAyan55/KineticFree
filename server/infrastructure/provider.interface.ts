export type ServerStatus =
  | "offline"
  | "starting"
  | "running"
  | "stopping"
  | "restarting"
  | "installing"
  | "restoring"
  | "suspended"
  | "error"

export type PowerAction = "start" | "stop" | "restart" | "kill"

export interface ServerResourcesResult {
  cpuUsage: number
  memoryUsage: number
  memoryLimit: number
  diskUsage: number
  diskLimit: number
  networkRx: number
  networkTx: number
  uptime: number
  state: ServerStatus
}

export interface ConsoleLogEntry {
  id: string
  content: string
  timestamp: string
  type: "output" | "command" | "system"
}

export interface PowerActionResult {
  accepted: boolean
  operationId: string
  status: string
}

export interface IInfrastructureProvider {
  getServerStatus(serverId: string): Promise<ServerStatus>
  getResources(serverId: string): Promise<ServerResourcesResult>
  sendPowerAction(serverId: string, action: PowerAction): Promise<PowerActionResult>
  sendCommand(serverId: string, command: string): Promise<{ accepted: boolean }>
  getConsoleHistory(serverId: string): Promise<ConsoleLogEntry[]>
  reinstall(serverId: string): Promise<PowerActionResult>
}
