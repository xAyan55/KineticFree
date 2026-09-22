import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Server as ServerIcon,
  Search,
  Terminal,
  Trash2,
  Ban,
  Check,
  ArrowUpRight,
  Shield,
} from "lucide-react"
import { admin as adminApi, servers as serverApi } from "@/lib/api"
import type { Server } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const AdminServers: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadServers()
  }, [])

  const loadServers = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getServersByAdmin()
      setServers(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSuspend = async (server: Server) => {
    try {
      if (server.status === "suspended") {
        await adminApi.unsuspendServer(server.id)
      } else {
        await adminApi.suspendServer(server.id)
      }
      loadServers()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = servers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
      s.nodeName.toLowerCase().includes(search.toLowerCase()) ||
      s.softwareName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
          FLEET CONTAINER OPERATIONS
        </h1>
        <p className="mt-1 text-xs text-zinc-400 font-mono">
          System-wide supervision of all active user instances, memory allocations, and owners
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Filter by server, owner, node..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2 pl-9 pr-4 text-xs font-mono text-white placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
        />
      </div>

      {/* Fleet Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/60 shadow-xl">
        <div className="divide-y divide-zinc-800/60">
          {filtered.map((server) => {
            const isSuspended = server.status === "suspended"
            const isRunning = server.status === "running"

            return (
              <div
                key={server.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-900/40 transition-colors gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    <ServerIcon className={`h-5 w-5 ${isRunning ? "text-emerald-400" : isSuspended ? "text-rose-400" : "text-zinc-500"}`} />
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
                        variant={isRunning ? "success" : isSuspended ? "danger" : "zinc"}
                        className="text-[9px] py-0 px-1 font-mono uppercase"
                      >
                        {server.status}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      Owner: <span className="text-zinc-300">{server.ownerEmail}</span> • Node: {server.nodeName} • {server.softwareName} {server.softwareVersion}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-right hidden md:block">
                    <div className="text-xs font-mono text-zinc-300">
                      {(server.limits?.memory / 1024).toFixed(1)} GB RAM
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500">
                      Port: {server.allocation?.port}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleSuspend(server)}
                      className="h-8 text-xs font-mono border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                    >
                      {isSuspended ? (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                          Unsuspend
                        </>
                      ) : (
                        <>
                          <Ban className="h-3.5 w-3.5 mr-1 text-amber-400" />
                          Suspend
                        </>
                      )}
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
    </div>
  )
}
