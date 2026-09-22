import React, { useEffect, useState } from "react"
import {
  Cpu,
  Plus,
  Trash2,
  Globe,
  Radio,
  HardDrive,
  Activity,
  Server as ServerIcon,
} from "lucide-react"
import { nodes as nodeApi } from "@/lib/api"
import type { Node } from "@/lib/types"
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

export const AdminNodes: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState("")
  const [fqdn, setFqdn] = useState("")
  const [location, setLocation] = useState("US-East (Ashburn)")
  const [memory, setMemory] = useState(65536) // 64 GB
  const [disk, setDisk] = useState(512000) // 512 GB

  useEffect(() => {
    loadNodes()
  }, [])

  const loadNodes = async () => {
    try {
      setLoading(true)
      const data = await nodeApi.list()
      setNodes(data)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !fqdn.trim()) return
    try {
      await nodeApi.create({
        name: name.trim(),
        fqdn: fqdn.trim(),
        location,
        memory,
        disk,
      })
      setCreateOpen(false)
      setName("")
      setFqdn("")
      loadNodes()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await nodeApi.delete(id)
      loadNodes()
    } catch (err) {
      console.error(err)
    }
  }

  const formatGb = (mb: number) => (mb / 1024).toFixed(1)

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            HOST NODE CLUSTERS
          </h1>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Physical bare-metal hypervisors running the Wings container virtualization daemon
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-semibold h-9"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Node Cluster
        </Button>
      </div>

      {/* Nodes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {nodes.map((node) => {
          const isOnline = node.status === "online"
          const memPercent = (node.memoryAllocated / node.memory) * 100
          const diskPercent = (node.diskAllocated / node.disk) * 100

          return (
            <div
              key={node.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5 space-y-4 backdrop-blur flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white font-mono">{node.name}</h3>
                      <Badge
                        variant={isOnline ? "success" : "danger"}
                        className="text-[9px] py-0 px-1 font-mono uppercase"
                      >
                        {node.status}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono mt-0.5 block">
                      {node.location} • {node.fqdn}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(node.id)}
                    className="rounded p-1 text-zinc-500 hover:text-rose-400"
                    title="Delete node"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 space-y-3 font-mono text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                      <span>RAM ALLOCATION</span>
                      <span className="text-zinc-200">{formatGb(node.memoryAllocated)} GB / {formatGb(node.memory)} GB</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${memPercent}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                      <span>STORAGE (NVMe)</span>
                      <span className="text-zinc-200">{formatGb(node.diskAllocated)} GB / {formatGb(node.disk)} GB</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${diskPercent}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span className="flex items-center gap-1">
                  <ServerIcon className="h-3.5 w-3.5" />
                  {node.serverCount} servers
                </span>
                <span>Daemon :8080 / SFTP :2022</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Node Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">Add Bare-Metal Node</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="node-name">Node Identifier</Label>
              <Input
                id="node-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. US-Ashburn-02"
                className="bg-black border-zinc-800 font-mono text-xs text-white"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="node-fqdn">Fully Qualified Domain (FQDN)</Label>
              <Input
                id="node-fqdn"
                value={fqdn}
                onChange={(e) => setFqdn(e.target.value)}
                placeholder="e.g. node2.kinetic.host"
                className="bg-black border-zinc-800 font-mono text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="node-ram">Total RAM (MB)</Label>
                <Input
                  id="node-ram"
                  type="number"
                  value={memory}
                  onChange={(e) => setMemory(Number(e.target.value))}
                  className="bg-black border-zinc-800 font-mono text-xs text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="node-disk">Disk (MB)</Label>
                <Input
                  id="node-disk"
                  type="number"
                  value={disk}
                  onChange={(e) => setDisk(Number(e.target.value))}
                  className="bg-black border-zinc-800 font-mono text-xs text-white"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-zinc-800 text-xs font-mono">
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim() || !fqdn.trim()} className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold">
                Deploy Node
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
