import React, { useEffect, useState } from "react"
import {
  History,
  Search,
  Filter,
  Shield,
  Eye,
} from "lucide-react"
import { admin as adminApi } from "@/lib/api"
import type { AuditEvent } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

export const AdminAuditLog: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadAudits()
  }, [])

  const loadAudits = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getAuditLog({ perPage: 50 })
      setEvents(res.data)
    } finally {
      setLoading(false)
    }
  }

  const filtered = events.filter(
    (e) =>
      e.actorName.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      (e.targetName && e.targetName.toLowerCase().includes(search.toLowerCase())) ||
      (e.ip && e.ip.includes(search))
  )

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
          GLOBAL AUDIT LEDGER
        </h1>
        <p className="mt-1 text-xs text-zinc-400 font-mono">
          Immutable forensic log of all administrative interventions, state overrides, and privileged actions
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Filter by actor, action, IP, target..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2 pl-9 pr-4 text-xs font-mono text-white placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
        />
      </div>

      {/* Audit Log Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/60 shadow-xl">
        <div className="grid grid-cols-12 border-b border-zinc-800/80 bg-black/40 px-4 py-2.5 text-[11px] font-mono font-medium text-zinc-500 uppercase">
          <div className="col-span-3 sm:col-span-2">Timestamp</div>
          <div className="col-span-3 sm:col-span-3">Staff Actor</div>
          <div className="col-span-3 sm:col-span-3">Action</div>
          <div className="col-span-3 sm:col-span-4 text-right sm:text-left">Target & IP</div>
        </div>

        <div className="divide-y divide-zinc-800/60 text-xs font-mono">
          {filtered.map((event) => (
            <div
              key={event.id}
              className="grid grid-cols-12 items-center px-4 py-3 hover:bg-zinc-900/40 transition-colors"
            >
              <div className="col-span-3 sm:col-span-2 text-zinc-400 text-[11px]">
                {new Date(event.createdAt).toLocaleString()}
              </div>

              <div className="col-span-3 sm:col-span-3 text-white font-bold truncate pr-2">
                {event.actorName}
              </div>

              <div className="col-span-3 sm:col-span-3">
                <Badge variant="zinc" className="text-[10px] py-0 px-1.5 font-mono">
                  {event.action}
                </Badge>
              </div>

              <div className="col-span-3 sm:col-span-4 text-right sm:text-left text-zinc-400">
                <span className="text-zinc-200">{event.targetName || event.targetId}</span>
                <span className="text-zinc-600 ml-2 hidden sm:inline">({event.ip})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
