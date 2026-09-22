import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Users,
  Server as ServerIcon,
  Cpu,
  HardDrive,
  Activity,
  Shield,
  Layers,
  Network,
  History,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react"
import { admin as adminApi } from "@/lib/api"
import type { AuditEvent } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<any>(null)
  const [recentAudits, setRecentAudits] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [s, audits] = await Promise.all([
        adminApi.getOverviewStats(),
        adminApi.getAuditLog({ perPage: 5 }),
      ])
      setStats(s)
      setRecentAudits(audits.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatGb = (mb: number) => (mb / 1024).toFixed(1)

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-mono sm:text-3xl">
              System Administration
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Platform health, cluster capacity metrics, and administrative audit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="border-zinc-800 text-xs font-mono">
            <Link to="/admin/nodes">
              <Cpu className="h-3.5 w-3.5 mr-1.5" />
              Manage Nodes
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold">
            <Link to="/admin/servers">
              <ServerIcon className="h-3.5 w-3.5 mr-1.5" />
              All Fleet Instances
            </Link>
          </Button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase text-zinc-500">Registered Users</span>
            <Users className="h-4 w-4" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {stats?.totalUsers ?? "--"}
            </span>
            <span className="text-xs font-mono text-emerald-400">
              {stats?.activeUsers ?? 0} active
            </span>
          </div>
          <p className="mt-3 text-[11px] font-mono text-zinc-500">Global account registry</p>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase text-zinc-500">Server Fleet</span>
            <ServerIcon className="h-4 w-4" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {stats?.totalServers ?? "--"}
            </span>
            <span className="text-xs font-mono text-emerald-400">
              {stats?.runningServers ?? 0} online
            </span>
          </div>
          <p className="mt-3 text-[11px] font-mono text-zinc-500">Active container instances</p>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase text-zinc-500">Cluster RAM</span>
            <Activity className="h-4 w-4" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {stats ? formatGb(stats.allocatedMemory) : "--"} GB
            </span>
            <span className="text-xs font-mono text-zinc-400">
              / {stats ? formatGb(stats.totalMemory) : "--"} GB
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{
                width: stats ? `${(stats.allocatedMemory / stats.totalMemory) * 100}%` : "0%",
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase text-zinc-500">Cluster NVMe</span>
            <HardDrive className="h-4 w-4" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {stats ? formatGb(stats.allocatedDisk) : "--"} GB
            </span>
            <span className="text-xs font-mono text-zinc-400">
              / {stats ? formatGb(stats.totalDisk) : "--"} GB
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full"
              style={{
                width: stats ? `${(stats.allocatedDisk / stats.totalDisk) * 100}%` : "0%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Navigation Sections */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "User Management", desc: "Accounts, permissions, & suspensions", icon: Users, path: "/admin/users" },
          { title: "Fleet Management", desc: "Oversee all user instances & power state", icon: ServerIcon, path: "/admin/servers" },
          { title: "Host Nodes", desc: "Hardware cluster and daemon status", icon: Cpu, path: "/admin/nodes" },
          { title: "IP Allocations", desc: "Port allocation tables and IP mappings", icon: Network, path: "/admin/allocations" },
        ].map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.path}
              to={card.path}
              className="group rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5 hover:border-zinc-700 hover:bg-zinc-900/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="mt-4 font-bold text-sm text-white font-mono">{card.title}</h3>
                <p className="mt-1 text-xs text-zinc-400 font-mono">{card.desc}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent Audit Ledger */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-zinc-400" />
            <h2 className="text-sm font-bold font-mono text-white uppercase">
              Recent Administrative Audit Events
            </h2>
          </div>
          <Button asChild variant="outline" size="sm" className="h-7 text-xs font-mono border-zinc-800">
            <Link to="/admin/audit-log">View Full Ledger</Link>
          </Button>
        </div>

        {recentAudits.length === 0 ? (
          <div className="py-6 text-center text-xs font-mono text-zinc-500">
            No recent administrative events recorded.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60 font-mono text-xs">
            {recentAudits.map((event) => (
              <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-white font-bold">{event.actorName}</span>
                  <span className="text-zinc-500">executed</span>
                  <Badge variant="zinc" className="text-[10px] py-0">
                    {event.action}
                  </Badge>
                  <span className="text-zinc-400 truncate max-w-[200px]">on {event.targetName || event.targetId}</span>
                </div>
                <div className="text-[11px] text-zinc-500">
                  IP: {event.ip} • {new Date(event.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
