import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  Calendar,
  Plus,
  Trash2,
  Play,
  Clock,
  CheckCircle2,
  Layers,
  Terminal,
  Power,
} from "lucide-react"
import { schedules as scheduleApi } from "@/lib/api"
import type { Schedule } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export const Schedules: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState("")
  const [cron, setCron] = useState("0 3 * * *")
  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null)

  useEffect(() => {
    if (id) loadSchedules()
  }, [id])

  const loadSchedules = async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await scheduleApi.list(id)
      setSchedules(data)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !id) return
    try {
      await scheduleApi.create(id, {
        name: name.trim(),
        cron,
        isActive: true,
        onlyWhenOnline: true,
      })
      setCreateOpen(false)
      setName("")
      loadSchedules()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || !id) return
    try {
      await scheduleApi.delete(id, deleteTarget.id)
      setDeleteTarget(null)
      loadSchedules()
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggle = async (sched: Schedule) => {
    if (!id) return
    try {
      await scheduleApi.update(id, sched.id, { isActive: !sched.isActive })
      setSchedules((prev) =>
        prev.map((s) => (s.id === sched.id ? { ...s, isActive: !s.isActive } : s))
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-white">
              AUTOMATED SCHEDULES
            </h1>
            <Badge variant="zinc" className="text-[10px] font-mono">
              Cron Engine
            </Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Automate server restarts, broadcast alerts, and periodic snapshot tasks
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-semibold h-9"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Schedule
        </Button>
      </div>

      {schedules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <Calendar className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400 font-mono">No automated routines configured.</p>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="mt-4 bg-white text-black hover:bg-zinc-200 text-xs font-mono"
          >
            Create Your First Schedule
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((sched) => (
            <div
              key={sched.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5 space-y-4 backdrop-blur"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-zinc-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white font-mono">{sched.name}</span>
                      <Badge variant="zinc" className="text-[10px] font-mono">
                        {sched.cron}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      Last: {sched.lastRunAt ? new Date(sched.lastRunAt).toLocaleString() : "Never"} • Next: {sched.nextRunAt ? new Date(sched.nextRunAt).toLocaleString() : "Pending"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400">
                      {sched.isActive ? "Enabled" : "Disabled"}
                    </span>
                    <Switch
                      checked={sched.isActive}
                      onCheckedChange={() => handleToggle(sched)}
                    />
                  </div>

                  <button
                    onClick={() => setDeleteTarget(sched)}
                    className="rounded p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tasks within schedule */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                  Action Chain
                </span>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {sched.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg bg-black border border-zinc-800/80 p-3 flex items-center gap-2.5 text-xs font-mono"
                    >
                      {task.action === "command" ? (
                        <Terminal className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      ) : (
                        <Power className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-zinc-300 font-bold uppercase text-[10px] block">
                          {task.action} (offset +{task.timeOffset}s)
                        </span>
                        <span className="text-zinc-400 truncate block text-[11px]">
                          {task.payload || "Trigger action"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">Create Schedule Routine</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-400">Routine Label</span>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Daily Reboot & Warning"
                className="bg-black border-zinc-800 font-mono text-xs"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-400">Cron Timing Expression</span>
              <Input
                value={cron}
                onChange={(e) => setCron(e.target.value)}
                placeholder="0 3 * * *"
                className="bg-black border-zinc-800 font-mono text-xs"
              />
              <span className="text-[10px] font-mono text-zinc-500 block">
                Standard 5-part cron syntax: Minute Hour Day Month Weekday
              </span>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-zinc-800 text-xs font-mono">
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim()} className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold">
                Deploy Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-rose-400">Delete Routine</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-zinc-300 font-mono">
            Permanently cancel automated routine <span className="text-white font-bold">{deleteTarget?.name}</span>?
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} className="border-zinc-800 text-xs font-mono">
              Cancel
            </Button>
            <Button type="button" onClick={handleDelete} className="bg-rose-600 text-white hover:bg-rose-700 text-xs font-mono">
              Delete Routine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
