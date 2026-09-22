import React, { useEffect, useRef, useState } from "react"
import { useOutletContext, useParams } from "react-router-dom"
import {
  Terminal as TerminalIcon,
  Send,
  Trash2,
  Lock,
  Unlock,
  Radio,
  Cpu,
  Activity,
  HardDrive,
  Download,
  Wifi,
} from "lucide-react"
import { servers as serverApi } from "@/lib/api"
import type { Server, ConsoleMessage, ServerResources } from "@/lib/types"
import { Button } from "@/components/ui/button"

export const Console: React.FC = () => {
  const { server } = useOutletContext<{ server: Server }>()
  const { id } = useParams<{ id: string }>()

  const [logs, setLogs] = useState<ConsoleMessage[]>([])
  const [command, setCommand] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [autoScroll, setAutoScroll] = useState(true)
  const [resources, setResources] = useState<ServerResources | null>(null)

  const logEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Poll resources and load real console history
  useEffect(() => {
    if (!id) return

    let active = true

    const fetchResources = async () => {
      try {
        const res = await serverApi.getResources(id)
        if (active) setResources(res)
      } catch (err) {
        if (active) setResources(null)
      }
    }

    // Fetch real console history from backend
    const fetchLogs = async () => {
      try {
        const history = await serverApi.getConsoleHistory(id)
        if (active) setLogs(history)
      } catch (err) {
        if (active) {
          setLogs([{
            id: "sys-err",
            content: "[SYSTEM]: Console disconnected — unable to reach backend.",
            timestamp: new Date().toISOString(),
            type: "system",
          }])
        }
      }
    }

    fetchResources()
    fetchLogs()

    // Only poll resources while server is running
    const resInterval = server.status === "running" ? setInterval(fetchResources, 3000) : null

    return () => {
      active = false
      if (resInterval) clearInterval(resInterval)
    }
  }, [id, server.status, server.limits.memory, server.softwareName, server.softwareVersion, server.allocation?.port])

  // Autoscroll
  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs, autoScroll])

  const handleSendCommand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!command.trim() || !id) return

    const cmd = command.trim()
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: `> ${cmd}`,
        timestamp: new Date().toISOString(),
        type: "command",
      },
    ])

    // Add to history
    setHistory((prev) => [cmd, ...prev])
    setHistoryIndex(-1)
    setCommand("")

    try {
      await serverApi.sendCommand(id, cmd)
      // Real output will arrive via console stream or next poll.
      // Do NOT fabricate any local response.
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: `[ERROR]: Failed to send command: ${err.message || "Unknown error"}`,
            timestamp: new Date().toISOString(),
            type: "system",
          },
      ])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1
        setHistoryIndex(nextIdx)
        setCommand(history[nextIdx])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1
        setHistoryIndex(nextIdx)
        setCommand(history[nextIdx])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setCommand("")
      }
    }
  }

  // Format ANSI / Color logs
  const formatLine = (msg: ConsoleMessage) => {
    const text = msg.content

    if (msg.type === "command") {
      return <span className="text-zinc-100 font-semibold">{text}</span>
    }
    if (msg.type === "system" || text.includes("ERROR") || text.includes("Exception")) {
      return <span className="text-rose-400">{text}</span>
    }
    if (text.includes("WARN") || text.includes("WARNING")) {
      return <span className="text-amber-400">{text}</span>
    }
    if (text.includes("Done (") || text.includes("flushed to NVMe")) {
      return <span className="text-emerald-400 font-medium">{text}</span>
    }
    if (text.includes("joined the game")) {
      return <span className="text-cyan-400">{text}</span>
    }
    return <span className="text-zinc-300">{text}</span>
  }

  const isOnline = server.status === "running"
  const telemetryAvailable = isOnline && resources !== null
  const memUsedMb = telemetryAvailable ? (resources.memoryUsage / 1024 / 1024).toFixed(0) : "—"
  const memLimitMb = server.limits.memory || 2048
  const cpuPercent = telemetryAvailable ? resources.cpuUsage.toFixed(1) : "—"
  const diskUsedMb = telemetryAvailable ? (resources.diskUsage / 1024 / 1024).toFixed(0) : "—"
  const diskLimitMb = server.limits.disk || 10240

  return (
    <div className="space-y-4">
      {/* Live Telemetry Bar */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3.5 backdrop-blur">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-zinc-400" />
              MEMORY
            </span>
            <span className="text-zinc-200 font-bold">{telemetryAvailable ? `${memUsedMb} MB / ${memLimitMb} MB` : "Telemetry unavailable"}</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, (Number(memUsedMb) / memLimitMb) * 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3.5 backdrop-blur">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-zinc-400" />
              CPU USAGE
            </span>
            <span className="text-zinc-200 font-bold">{telemetryAvailable ? `${cpuPercent}% / ${server.limits.cpu}%` : "Telemetry unavailable"}</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, (Number(cpuPercent) / (server.limits.cpu || 100)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3.5 backdrop-blur">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-zinc-400" />
              STORAGE
            </span>
            <span className="text-zinc-200 font-bold">{telemetryAvailable ? `${diskUsedMb} MB / ${diskLimitMb} MB` : "Telemetry unavailable"}</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full bg-blue-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, (Number(diskUsedMb) / diskLimitMb) * 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3.5 backdrop-blur">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5 text-zinc-400" />
              NETWORK I/O
            </span>
            <span className={`font-mono text-[11px] ${telemetryAvailable ? "text-emerald-400" : "text-zinc-500"}`}>{telemetryAvailable ? "Active" : "Unavailable"}</span>
          </div>
          <div className="mt-2 text-xs font-mono text-zinc-300 flex justify-between">
            <span>Rx: {telemetryAvailable ? `${((resources.networkRx || 0) / 1024 / 1024).toFixed(1)} MB` : "—"}</span>
            <span>Tx: {telemetryAvailable ? `${((resources.networkTx || 0) / 1024 / 1024).toFixed(1)} MB` : "—"}</span>
          </div>
        </div>
      </div>

      {/* Terminal Window Container */}
      <div className="flex flex-col rounded-xl border border-zinc-800/90 bg-zinc-950/95 overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 bg-black/70 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs font-mono text-zinc-400 ml-2">
              bash — rcon@{server.id}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] mr-2">
              <Radio className="h-3 w-3 animate-pulse" />
              <span className="hidden sm:inline">Stream Connected</span>
            </div>

            <button
              onClick={() => setAutoScroll(!autoScroll)}
              title={autoScroll ? "Disable Auto-scroll" : "Enable Auto-scroll"}
              className={`flex items-center gap-1 rounded px-2 py-1 transition-colors ${
                autoScroll
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {autoScroll ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              <span className="hidden sm:inline">Scroll Lock</span>
            </button>

            <button
              onClick={() => setLogs([])}
              title="Clear Console"
              className="rounded p-1 text-zinc-500 hover:text-white transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Log Area */}
        <div className="h-[480px] overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-1 select-text scrollbar-thin scrollbar-thumb-zinc-800 bg-black/60">
          {logs.map((log) => (
            <div key={log.id} className="whitespace-pre-wrap break-all">
              {formatLine(log)}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>

        {/* Quick Commands Strip */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-zinc-800/80 bg-zinc-950/80 px-4 py-2">
          <span className="text-[10px] font-mono uppercase text-zinc-500 mr-1">Quick:</span>
          {["tps", "list", "save-all", "say Server restart in 5m", "help"].map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                setCommand(cmd)
                inputRef.current?.focus()
              }}
              className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[11px] font-mono text-zinc-400 hover:border-zinc-700 hover:text-white transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Command Input Prompt */}
        <form
          onSubmit={handleSendCommand}
          className="flex items-center border-t border-zinc-800/80 bg-black px-4 py-3"
        >
          <span className="font-mono text-sm font-bold text-zinc-400 mr-2 select-none">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              server.status === "running"
                ? "Type a Minecraft command (e.g. op, tps, say, whitelist)..."
                : "Server is offline. Start the server to interact with console."
            }
            disabled={server.status === "offline"}
            className="flex-1 bg-transparent font-mono text-xs text-white placeholder-zinc-600 focus:outline-none disabled:opacity-50"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!command.trim() || server.status === "offline"}
            className="h-7 px-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold"
          >
            <Send className="h-3 w-3 mr-1" />
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}
