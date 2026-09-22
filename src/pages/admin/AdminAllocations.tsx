import React, { useEffect, useState } from "react"
import {
  Network,
  Plus,
  Trash2,
  Check,
  Search,
  Filter,
} from "lucide-react"
import { allocations as allocApi, nodes as nodeApi } from "@/lib/api"
import type { Allocation, Node } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export const AdminAllocations: React.FC = () => {
  const [allocs, setAllocs] = useState<Allocation[]>([])
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "assigned" | "free">("all")

  // Create allocation modal
  const [createOpen, setCreateOpen] = useState(false)
  const [ip, setIp] = useState("192.168.1.100")
  const [ports, setPorts] = useState("25565")
  const [selectedNode, setSelectedNode] = useState("")

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      const [res, n] = await Promise.all([allocApi.list(), nodeApi.list()])
      setAllocs(res.data)
      setNodes(n)
      if (n.length > 0) setSelectedNode(n[0].id)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ip.trim() || !ports.trim()) return
    try {
      await allocApi.create({
        ip: ip.trim(),
        port: Number(ports.trim()),
        nodeId: selectedNode,
      })
      setCreateOpen(false)
      load()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await allocApi.delete(id)
      load()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = allocs.filter((a) => {
    const matches =
      a.ip.includes(search) ||
      a.port.toString().includes(search) ||
      (a.serverName && a.serverName.toLowerCase().includes(search.toLowerCase()))
    if (filter === "assigned") return matches && a.assigned
    if (filter === "free") return matches && !a.assigned
    return matches
  })

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            IP & PORT ALLOCATIONS
          </h1>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Manage public-facing network endpoints across edge cluster nodes
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-semibold h-9"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Assign Ports
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search IP, port, server..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2 pl-9 pr-4 text-xs font-mono text-white placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {(["all", "assigned", "free"] as const).map((mode) => (
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

      {/* Allocations Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/60 shadow-xl">
        <div className="grid grid-cols-12 border-b border-zinc-800/80 bg-black/40 px-4 py-2.5 text-[11px] font-mono font-medium text-zinc-500 uppercase">
          <div className="col-span-4 sm:col-span-4">Address (IP:Port)</div>
          <div className="col-span-3 sm:col-span-3">Node</div>
          <div className="col-span-3 sm:col-span-3">Assigned Server</div>
          <div className="col-span-2 sm:col-span-2 text-right">Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-500">
            No port allocations found.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60 text-xs font-mono">
            {filtered.map((alloc) => (
              <div
                key={alloc.id}
                className="grid grid-cols-12 items-center px-4 py-3 hover:bg-zinc-900/40 transition-colors"
              >
                <div className="col-span-4 sm:col-span-4 flex items-center gap-2">
                  <span className="font-bold text-white">{alloc.ip}:{alloc.port}</span>
                  {alloc.assigned ? (
                    <Badge variant="zinc" className="text-[9px] py-0 px-1">IN USE</Badge>
                  ) : (
                    <Badge variant="success" className="text-[9px] py-0 px-1">AVAILABLE</Badge>
                  )}
                </div>

                <div className="col-span-3 sm:col-span-3 text-zinc-400">
                  {alloc.nodeName}
                </div>

                <div className="col-span-3 sm:col-span-3 text-zinc-300">
                  {alloc.serverName || <span className="text-zinc-600">—</span>}
                </div>

                <div className="col-span-2 sm:col-span-2 text-right">
                  {!alloc.assigned && (
                    <button
                      onClick={() => handleDelete(alloc.id)}
                      className="rounded p-1 text-zinc-500 hover:text-rose-400"
                      title="Delete allocation"
                    >
                      <Trash2 className="h-4 w-4 ml-auto" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">Assign Network Port</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alloc-node">Target Host Node</Label>
              <select
                id="alloc-node"
                value={selectedNode}
                onChange={(e) => setSelectedNode(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-xs font-mono text-white focus:outline-none"
              >
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alloc-ip">IP Address</Label>
              <Input
                id="alloc-ip"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="bg-black border-zinc-800 font-mono text-xs text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alloc-port">Port Number</Label>
              <Input
                id="alloc-port"
                type="number"
                value={ports}
                onChange={(e) => setPorts(e.target.value)}
                className="bg-black border-zinc-800 font-mono text-xs text-white"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-zinc-800 text-xs font-mono">
                Cancel
              </Button>
              <Button type="submit" className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold">
                Assign Port
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
