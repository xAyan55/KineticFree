import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  Archive,
  Plus,
  Download,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react"
import { backups as backupApi } from "@/lib/api"
import type { Backup } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export const Backups: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [backupName, setBackupName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Backup | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<Backup | null>(null)
  const [isRestoring, setIsRestoring] = useState(false)

  useEffect(() => {
    if (id) loadBackups()
  }, [id])

  const loadBackups = async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await backupApi.list(id)
      setBackups(data)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    const name = backupName.trim() || `backup_${new Date().toISOString().slice(0, 10)}`
    try {
      await backupApi.create(id, name)
      setCreateOpen(false)
      setBackupName("")
      loadBackups()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || !id) return
    try {
      await backupApi.delete(id, deleteTarget.id)
      setDeleteTarget(null)
      loadBackups()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRestore = async () => {
    if (!restoreTarget || !id) return
    setIsRestoring(true)
    try {
      await backupApi.restore(id, restoreTarget.id)
      setRestoreTarget(null)
    } catch (err) {
      console.error(err)
    } finally {
      setIsRestoring(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "Calculating..."
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-white">
              SNAPSHOT BACKUPS
            </h1>
            <Badge variant="zinc" className="text-[10px] font-mono">
              {backups.length} / 3 Snapshots
            </Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Full container archives including world data, plugins, and configs
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          disabled={backups.length >= 3}
          className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-semibold h-9"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Snapshot
        </Button>
      </div>

      {backups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <Archive className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400 font-mono">No backup snapshots exist for this server.</p>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="mt-4 bg-white text-black hover:bg-zinc-200 text-xs font-mono"
          >
            Create Your First Snapshot
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/60 shadow-xl">
          <div className="divide-y divide-zinc-800/60">
            {backups.map((bak) => {
              const isCompleted = bak.status === "completed"
              return (
                <div
                  key={bak.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-900/40 transition-colors gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      {isCompleted ? (
                        <Archive className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-mono">{bak.name}</span>
                        <Badge
                          variant={isCompleted ? "success" : "warning"}
                          className="text-[9px] py-0 px-1 font-mono uppercase"
                        >
                          {bak.status}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {formatSize(bak.size)} • {new Date(bak.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!isCompleted}
                      onClick={() => setRestoreTarget(bak)}
                      className="h-8 text-xs font-mono border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Restore
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!isCompleted}
                      onClick={() => alert(`Simulated downloading backup: ${bak.name}.tar.gz`)}
                      className="h-8 text-xs font-mono border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteTarget(bak)}
                      className="h-8 text-xs font-mono border-zinc-800 hover:bg-rose-950/20 hover:text-rose-400 hover:border-rose-900"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Create Snapshot Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">Create Backup Snapshot</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-400">Snapshot Label</span>
              <Input
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder="e.g. Pre-EnderDragon or Daily-Backup"
                className="bg-black border-zinc-800 font-mono text-xs"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-zinc-800 text-xs font-mono">
                Cancel
              </Button>
              <Button type="submit" className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold">
                Start Archive
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={!!restoreTarget} onOpenChange={() => setRestoreTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-amber-400">Restore Snapshot</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-zinc-300 font-mono">
            Restoring <span className="text-white font-bold">{restoreTarget?.name}</span> will overwrite the current world, plugins, and server files. Are you sure you wish to proceed?
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRestoreTarget(null)} className="border-zinc-800 text-xs font-mono">
              Cancel
            </Button>
            <Button type="button" disabled={isRestoring} onClick={handleRestore} className="bg-amber-500 text-black hover:bg-amber-400 text-xs font-mono font-bold">
              {isRestoring ? "Restoring Archive..." : "Confirm & Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-rose-400">Delete Snapshot</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-zinc-300 font-mono">
            Permanently delete snapshot <span className="text-white font-bold">{deleteTarget?.name}</span>?
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} className="border-zinc-800 text-xs font-mono">
              Cancel
            </Button>
            <Button type="button" onClick={handleDelete} className="bg-rose-600 text-white hover:bg-rose-700 text-xs font-mono">
              Delete Snapshot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
