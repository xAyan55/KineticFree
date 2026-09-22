import React, { useEffect, useState } from "react"
import {
  useParams,
  useNavigate,
  useLocation,
  Link,
  Outlet,
} from "react-router-dom"
import {
  Terminal,
  Activity,
  FolderTree,
  Database,
  Archive,
  Calendar,
  Network,
  PlaySquare,
  Settings,
  ArrowLeft,
  Copy,
  Check,
  Power,
  RotateCw,
  Skull,
  ExternalLink,
} from "lucide-react"
import { servers as serverApi } from "@/lib/api"
import type { Server } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export const ServerLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const [server, setServer] = useState<Server | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (id) loadServer(id)
  }, [id])

  const loadServer = async (serverId: string) => {
    try {
      setLoading(true)
      const data = await serverApi.get(serverId)
      setServer(data)
    } catch (err: any) {
      setError(err.message || "Failed to load server")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyIp = () => {
    if (!server) return
    const ip = `${server.allocation?.ip || "edge.kinetic.host"}:${server.allocation?.port || 25565}`
    navigator.clipboard.writeText(ip)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePower = async (action: "start" | "stop" | "restart" | "kill") => {
    if (!server) return
    setActionLoading(true)
    try {
      await serverApi.sendPowerAction(server.id, action)
      // optimistic update
      const stateMap: Record<string, Server["status"]> = {
        start: "starting",
        stop: "stopping",
        restart: "restarting",
        kill: "offline",
      }
      setServer((prev) => (prev ? { ...prev, status: stateMap[action] || prev.status } : null))

      // Refresh real state shortly
      setTimeout(async () => {
        if (id) {
          const fresh = await serverApi.get(id)
          setServer(fresh)
        }
      }, 1500)
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const navTabs = [
    { label: "Console", path: `/dashboard/servers/${id}/console`, icon: Terminal },
    { label: "Metrics", path: `/dashboard/servers/${id}`, icon: Activity, exact: true },
    { label: "Files", path: `/dashboard/servers/${id}/files`, icon: FolderTree },
    { label: "Databases", path: `/dashboard/servers/${id}/databases`, icon: Database },
    { label: "Backups", path: `/dashboard/servers/${id}/backups`, icon: Archive },
    { label: "Schedules", path: `/dashboard/servers/${id}/schedules`, icon: Calendar },
    { label: "Network", path: `/dashboard/servers/${id}/network`, icon: Network },
    { label: "Startup", path: `/dashboard/servers/${id}/startup`, icon: PlaySquare },
    { label: "Settings", path: `/dashboard/servers/${id}/settings`, icon: Settings },
  ]

  if (loading && !server) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !server) {
    return (
      <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-8 text-center">
        <p className="text-sm text-rose-400 font-mono">{error || "Server not found"}</p>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="mt-4 border-zinc-800 text-xs font-mono"
        >
          <Link to="/dashboard/servers">Back to Server Fleet</Link>
        </Button>
      </div>
    )
  }

  const isRunning = server.status === "running"
  const isTransitioning = ["starting", "stopping", "restarting"].includes(server.status)
  const fullIp = `${server.allocation?.ip || "edge.kinetic.host"}:${server.allocation?.port || 25565}`

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard/servers"
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-mono transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Fleet</span>
        </Link>
        <span className="text-xs font-mono text-zinc-500">ID: {server.id}</span>
      </div>

      {/* Server Header Hero Card */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-5 backdrop-blur-md">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white font-mono sm:text-2xl">
                {server.name}
              </h1>
              <Badge
                variant={isRunning ? "success" : isTransitioning ? "warning" : "zinc"}
                className="gap-1.5 py-0.5 font-mono text-[10px] uppercase"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isRunning
                      ? "bg-emerald-400 animate-pulse"
                      : isTransitioning
                      ? "bg-amber-400 animate-pulse"
                      : "bg-zinc-500"
                  }`}
                />
                {server.status}
              </Badge>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                {server.softwareName} {server.softwareVersion}
              </span>
              <span>•</span>
              <span>Node: {server.nodeName}</span>
              <span>•</span>
              <div className="flex items-center gap-1 rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-zinc-200">
                <span>{fullIp}</span>
                <button
                  onClick={handleCopyIp}
                  className="text-zinc-400 hover:text-white transition-colors"
                  title="Copy IP"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Power Controls */}
          <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800/80 pt-4 lg:border-t-0 lg:pt-0">
            <Button
              size="sm"
              disabled={isRunning || isTransitioning || actionLoading}
              onClick={() => handlePower("start")}
              className="bg-emerald-600 text-white hover:bg-emerald-500 font-mono text-xs h-8 px-3 gap-1.5"
            >
              <Power className="h-3.5 w-3.5" />
              <span>Start</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={!isRunning || isTransitioning || actionLoading}
              onClick={() => handlePower("restart")}
              className="border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 font-mono text-xs h-8 px-3 gap-1.5"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Restart</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={server.status === "offline" || isTransitioning || actionLoading}
              onClick={() => handlePower("stop")}
              className="border-zinc-800 bg-zinc-900 text-rose-300 hover:bg-rose-950/40 hover:border-rose-800 font-mono text-xs h-8 px-3 gap-1.5"
            >
              <Power className="h-3.5 w-3.5" />
              <span>Stop</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={server.status === "offline" || actionLoading}
              onClick={() => handlePower("kill")}
              title="Force Kill (Immediate SIGKILL)"
              className="border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-rose-500 hover:border-rose-800/80 h-8 px-2"
            >
              <Skull className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="border-b border-zinc-800/80 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 min-w-max pb-px">
          {navTabs.map((tab) => {
            const isActive = tab.exact
              ? location.pathname === tab.path
              : location.pathname === tab.path || location.pathname.startsWith(tab.path + "/")
            const Icon = tab.icon

            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-medium transition-colors border-b-2 ${
                  isActive
                    ? "border-white text-white font-semibold"
                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-zinc-500"}`} />
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Nested Route View */}
      <Outlet context={{ server, reloadServer: () => id && loadServer(id) }} />
    </div>
  )
}
