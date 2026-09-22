import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Server as ServerIcon,
  Cpu,
  HardDrive,
  Activity,
  Plus,
  Power,
  RotateCw,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Search,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react"
import { servers as serverApi } from "@/lib/api"
import type { Server } from "@/lib/types"
import { useAuthStore } from "@/lib/auth/store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export const DashboardOverview: React.FC = () => {
  const { user } = useAuthStore()
  const [serverList, setServerList] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [powerLoading, setPowerLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadServers()
  }, [])

  const loadServers = async () => {
    try {
      setLoading(true)
      const data = await serverApi.list()
      setServerList(data)
    } catch (err) {
      console.error("Failed to fetch servers", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyIp = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handlePowerAction = async (serverId: string, action: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPowerLoading((prev) => ({ ...prev, [serverId]: true }))
    try {
      await serverApi.sendPowerAction(serverId, action)
      // Refresh state
      const updated = await serverApi.list()
      setServerList(updated)
    } catch (err) {
      console.error("Failed power action", err)
    } finally {
      setPowerLoading((prev) => ({ ...prev, [serverId]: false }))
    }
  }

  const filteredServers = serverList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.softwareName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nodeName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const runningCount = serverList.filter((s) => s.status === "running").length
  const totalMemory = serverList.reduce((acc, s) => acc + (s.limits?.memory || 0), 0)
  const totalCpu = serverList.reduce((acc, s) => acc + (s.limits?.cpu || 0), 0)

  const getStatusBadge = (status: Server["status"]) => {
    switch (status) {
      case "running":
        return (
          <Badge variant="success" className="gap-1.5 py-0.5 font-mono text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ONLINE
          </Badge>
        )
      case "starting":
      case "restarting":
        return (
          <Badge variant="warning" className="gap-1.5 py-0.5 font-mono text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            {status.toUpperCase()}
          </Badge>
        )
      case "stopping":
        return (
          <Badge variant="danger" className="gap-1.5 py-0.5 font-mono text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
            STOPPING
          </Badge>
        )
      case "installing":
        return (
          <Badge variant="zinc" className="gap-1.5 py-0.5 font-mono text-[10px]">
            INSTALLING
          </Badge>
        )
      default:
        return (
          <Badge variant="zinc" className="gap-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
            OFFLINE
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono sm:text-3xl">
              CONTROL CONSOLE
            </h1>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 font-mono">
              v2.4
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Welcome back, <span className="text-white font-medium">{user?.name}</span>. Manage your high-performance game instances and edge infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            className="bg-white text-black hover:bg-zinc-200 font-semibold text-xs h-9 px-4 gap-2"
          >
            <Link to="/dashboard/servers/create">
              <Plus className="h-4 w-4" />
              Deploy Instance
            </Link>
          </Button>
        </div>
      </div>

      {/* Global Telemetry Metric Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-500">
              Total Instances
            </span>
            <ServerIcon className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {loading ? "--" : serverList.length}
            </span>
            <span className="text-xs font-mono text-emerald-400">
              {runningCount} active
            </span>
          </div>
          <div className="mt-2 h-1 w-full rounded-full bg-zinc-800">
            <div
              className="h-1 rounded-full bg-emerald-500 transition-all duration-500"
              style={{
                width: serverList.length > 0 ? `${(runningCount / serverList.length) * 100}%` : "0%",
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-500">
              Allocated RAM
            </span>
            <Activity className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {loading ? "--" : `${(totalMemory / 1024).toFixed(1)} GB`}
            </span>
            <span className="text-xs font-mono text-zinc-400">of 16.0 GB quota</span>
          </div>
          <div className="mt-2 h-1 w-full rounded-full bg-zinc-800">
            <div
              className="h-1 rounded-full bg-white transition-all duration-500"
              style={{ width: `${Math.min(100, (totalMemory / 16384) * 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-500">
              CPU Pool Share
            </span>
            <Cpu className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {loading ? "--" : `${totalCpu}%`}
            </span>
            <span className="text-xs font-mono text-zinc-400">dedicated share</span>
          </div>
          <div className="mt-2 h-1 w-full rounded-full bg-zinc-800">
            <div
              className="h-1 rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (totalCpu / 400) * 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-500">
              Edge Infrastructure
            </span>
            <HardDrive className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">100%</span>
            <span className="text-xs font-mono text-emerald-400">99.98% SLA</span>
          </div>
          <div className="mt-2 text-[11px] font-mono text-zinc-400 truncate">
            Primary: US-East-Ashburn
          </div>
        </div>
      </div>

      {/* Server Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white font-mono">
              SERVER FLEET
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Live Minecraft instances and container states
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search instances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-zinc-700 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Server Cards Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-56 rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-5 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-48" />
                <div className="space-y-2 pt-4">
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredServers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800/80 bg-zinc-950/30 p-12 text-center">
            <div className="rounded-full bg-zinc-900 border border-zinc-800 p-4 text-zinc-400">
              <ServerIcon className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white font-mono">No instances found</h3>
            <p className="mt-1 text-xs text-zinc-400 max-w-sm">
              {searchQuery
                ? `No server matches "${searchQuery}". Clear your search query to see all instances.`
                : "You don't have any Minecraft servers deployed yet. Launch your first high-speed Paper/Fabric server now."}
            </p>
            {!searchQuery && (
              <Button
                asChild
                className="mt-5 bg-white text-black hover:bg-zinc-200 text-xs font-semibold"
              >
                <Link to="/dashboard/servers/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Deploy Your First Server
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredServers.map((server) => {
              const fullIp = `${server.allocation?.ip || "edge.kinetic.host"}:${server.allocation?.port || 25565}`
              const isBusy = powerLoading[server.id]

              return (
                <div
                  key={server.id}
                  className="group relative flex flex-col justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/40 hover:shadow-xl backdrop-blur-sm"
                >
                  <div>
                    {/* Top Row: Title & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/dashboard/servers/${server.id}`}
                          className="font-bold text-sm text-white hover:underline flex items-center gap-1.5 font-mono group-hover:text-zinc-100"
                        >
                          <span className="truncate">{server.name}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 shrink-0" />
                        </Link>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          {server.softwareName} {server.softwareVersion} • {server.nodeName}
                        </p>
                      </div>
                      {getStatusBadge(server.status)}
                    </div>

                    {/* Address pill */}
                    <div className="mt-4 flex items-center justify-between rounded-lg bg-zinc-900/90 border border-zinc-800/80 px-3 py-1.5">
                      <span className="font-mono text-xs text-zinc-300 truncate select-all">
                        {fullIp}
                      </span>
                      <button
                        onClick={() => handleCopyIp(fullIp, server.id)}
                        className="ml-2 rounded p-1 text-zinc-400 hover:text-white transition-colors"
                        title="Copy IP:Port"
                      >
                        {copiedId === server.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Resources Preview */}
                    <div className="mt-4 space-y-2.5">
                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                          <span>RAM ALLOCATION</span>
                          <span className="text-zinc-300">
                            {server.limits?.memory ? `${(server.limits.memory / 1024).toFixed(1)} GB` : "2.0 GB"}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
                          <div
                            className="h-full bg-zinc-300 rounded-full"
                            style={{
                              width: server.status === "running" ? "65%" : "0%",
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                          <span>CPU PRIORITY</span>
                          <span className="text-zinc-300">
                            {server.limits?.cpu ? `${server.limits.cpu}%` : "100%"}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
                          <div
                            className="h-full bg-zinc-500 rounded-full"
                            style={{
                              width: server.status === "running" ? "35%" : "0%",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-center justify-between gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-mono border-zinc-800 hover:bg-zinc-800 hover:text-white gap-1.5 flex-1"
                    >
                      <Link to={`/dashboard/servers/${server.id}/console`}>
                        <Terminal className="h-3.5 w-3.5 text-zinc-400" />
                        Console
                      </Link>
                    </Button>

                    <div className="flex items-center gap-1.5">
                      {server.status === "running" ? (
                        <>
                          <button
                            disabled={isBusy}
                            onClick={(e) => handlePowerAction(server.id, "restart", e)}
                            title="Restart Instance"
                            className="h-8 w-8 rounded-md border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 transition-colors disabled:opacity-50"
                          >
                            <RotateCw className={`h-3.5 w-3.5 ${isBusy ? "animate-spin" : ""}`} />
                          </button>
                          <button
                            disabled={isBusy}
                            onClick={(e) => handlePowerAction(server.id, "stop", e)}
                            title="Stop Instance"
                            className="h-8 w-8 rounded-md border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors disabled:opacity-50"
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          disabled={isBusy}
                          onClick={(e) => handlePowerAction(server.id, "start", e)}
                          title="Start Instance"
                          className="h-8 w-8 rounded-md border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors disabled:opacity-50"
                        >
                          <Power className={`h-3.5 w-3.5 ${isBusy ? "animate-pulse" : ""}`} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Edge Node Status Quick Banner */}
      <div className="rounded-xl border border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-zinc-900/60 to-zinc-950 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="rounded-lg bg-zinc-900 p-2.5 border border-zinc-800 text-emerald-400 shrink-0">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-white tracking-wide uppercase">
              Free Tier High Performance Edge Architecture
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Powered by AMD Ryzen 9 7950X / DDR5 RAM. No hidden throttles or sleep timers on active sessions.
            </p>
          </div>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="text-xs font-mono border-zinc-800 hover:bg-zinc-800 shrink-0"
        >
          <a href="https://discord.gg" target="_blank" rel="noreferrer">
            <span>Join Discord Support</span>
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </div>
  )
}
