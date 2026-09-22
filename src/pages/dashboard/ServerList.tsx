import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Server as ServerIcon,
  Plus,
  Terminal,
  Copy,
  Check,
  Search,
  ArrowUpRight,
  Filter,
} from "lucide-react"
import { servers as serverApi } from "@/lib/api"
import type { Server } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export const ServerList: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const data = await serverApi.list()
      setServers(data)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filtered = servers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.softwareName.toLowerCase().includes(search.toLowerCase()) ||
      s.nodeName.toLowerCase().includes(search.toLowerCase())
    if (filter === "running") return matchesSearch && s.status === "running"
    if (filter === "offline") return matchesSearch && s.status === "offline"
    return matchesSearch
  })

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            MY INSTANCES
          </h1>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            All active, suspended, and provisioned Minecraft environments
          </p>
        </div>
        <Button asChild className="bg-white text-black hover:bg-zinc-200 text-xs font-semibold h-9">
          <Link to="/dashboard/servers/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Server
          </Link>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter by name, software, node..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-zinc-700 focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "running", "offline"].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-colors ${
                filter === mode
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800/80"
              }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <ServerIcon className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400 font-mono">No instances found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/60">
          <div className="divide-y divide-zinc-800/60">
            {filtered.map((server) => {
              const fullIp = `${server.allocation?.ip || "edge.kinetic.host"}:${server.allocation?.port || 25565}`
              const isRunning = server.status === "running"
              return (
                <div
                  key={server.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-900/40 transition-colors gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      <ServerIcon className={`h-5 w-5 ${isRunning ? "text-emerald-400" : "text-zinc-500"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/dashboard/servers/${server.id}`}
                          className="font-bold text-sm text-white hover:underline font-mono"
                        >
                          {server.name}
                        </Link>
                        <Badge
                          variant={isRunning ? "success" : "zinc"}
                          className="text-[9px] py-0 px-1.5 font-mono uppercase"
                        >
                          {server.status}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {server.softwareName} {server.softwareVersion} • Node: {server.nodeName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="flex items-center gap-2 rounded bg-zinc-900 border border-zinc-800 px-2.5 py-1">
                      <span className="font-mono text-xs text-zinc-300">{fullIp}</span>
                      <button
                        onClick={() => handleCopy(fullIp, server.id)}
                        className="text-zinc-500 hover:text-white"
                      >
                        {copiedId === server.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    <div className="text-right hidden md:block">
                      <div className="text-xs font-mono text-zinc-300">
                        {(server.limits?.memory / 1024).toFixed(1)} GB RAM
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        {server.limits?.cpu}% CPU / {(server.limits?.disk / 1024).toFixed(0)} GB SSD
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-mono border-zinc-800 hover:bg-zinc-800"
                      >
                        <Link to={`/dashboard/servers/${server.id}`}>
                          Manage
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="h-8 text-xs font-mono bg-white text-black hover:bg-zinc-200"
                      >
                        <Link to={`/dashboard/servers/${server.id}/console`}>
                          <Terminal className="h-3.5 w-3.5 mr-1" />
                          Console
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
