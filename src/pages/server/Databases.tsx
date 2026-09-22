import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  Database as DbIcon,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  RotateCw,
} from "lucide-react"
import { databases as dbApi } from "@/lib/api"
import type { Database } from "@/lib/types"
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

export const Databases: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [databases, setDatabases] = useState<Database[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [newDbName, setNewDbName] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Database | null>(null)
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({})
  const [resettingId, setResettingId] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    if (id) loadDatabases()
  }, [id])

  const loadDatabases = async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await dbApi.list(id)
      setDatabases(data)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDbName.trim() || !id) return
    try {
      const newDb = await dbApi.create(id, newDbName.trim())
      setCreateOpen(false)
      setNewDbName("")
      if (newDb.password) {
        setRevealedPasswords((prev) => ({ ...prev, [newDb.id]: newDb.password! }))
        setShowPassword((prev) => ({ ...prev, [newDb.id]: true }))
      }
      loadDatabases()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || !id) return
    try {
      await dbApi.delete(id, deleteTarget.id)
      setDeleteTarget(null)
      loadDatabases()
    } catch (err) {
      console.error(err)
    }
  }

  const handleResetPassword = async (dbId: string) => {
    if (!id) return
    try {
      setResettingId(dbId)
      const res = await dbApi.resetPassword(id, dbId)
      setRevealedPasswords((prev) => ({ ...prev, [dbId]: res.password }))
      setShowPassword((prev) => ({ ...prev, [dbId]: true }))
    } catch (err: any) {
      alert(err.message || "Failed to reset database password")
    } finally {
      setResettingId(null)
    }
  }

  const copyVal = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-white">
              MYSQL DATABASES
            </h1>
            <Badge variant="zinc" className="text-[10px] font-mono">
              {databases.length} / 2 Provisioned
            </Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Low-latency relational storage for LuckPerms, CoreProtect, Vault, and economy plugins
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          disabled={databases.length >= 2}
          className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-semibold h-9"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create Database
        </Button>
      </div>

      {databases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <DbIcon className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400 font-mono">No databases configured for this server.</p>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="mt-4 bg-white text-black hover:bg-zinc-200 text-xs font-mono"
          >
            Create Your First Database
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {databases.map((db) => {
            const isVisible = showPassword[db.id]
            const activePassword = revealedPasswords[db.id] || db.password

            return (
              <div
                key={db.id}
                className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5 space-y-4 backdrop-blur"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <DbIcon className="h-4 w-4 text-zinc-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white font-mono">{db.name}</h3>
                      <span className="text-[10px] text-zinc-400 font-mono uppercase">MariaDB / MySQL</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteTarget(db)}
                    className="rounded p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="divide-y divide-zinc-800/60 font-mono text-xs pt-1">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-zinc-500">Endpoint</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-200">{db.host}:{db.port}</span>
                      <button onClick={() => copyVal(`${db.host}:${db.port}`, `endpoint_${db.id}`)} className="text-zinc-500 hover:text-white">
                        {copiedKey === `endpoint_${db.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-zinc-500">Username</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-200">{db.username}</span>
                      <button onClick={() => copyVal(db.username, `user_${db.id}`)} className="text-zinc-500 hover:text-white">
                        {copiedKey === `user_${db.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-zinc-500">Password</span>
                    <div className="flex items-center gap-2">
                      {activePassword ? (
                        <>
                          <span className="text-zinc-200 select-all">
                            {isVisible ? activePassword : "••••••••••••••••"}
                          </span>
                          <button
                            onClick={() => setShowPassword((prev) => ({ ...prev, [db.id]: !isVisible }))}
                            className="text-zinc-500 hover:text-white"
                          >
                            {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => copyVal(activePassword, `pwd_${db.id}`)} className="text-zinc-500 hover:text-white">
                            {copiedKey === `pwd_${db.id}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">••••••••••••••••</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetPassword(db.id)}
                            disabled={resettingId === db.id}
                            className="h-6 text-[10px] font-mono border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-2 gap-1"
                          >
                            <RotateCw className={`h-3 w-3 ${resettingId === db.id ? "animate-spin" : ""}`} />
                            Reset Password
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">Create MySQL Database</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-400">Database Name</span>
              <Input
                value={newDbName}
                onChange={(e) => setNewDbName(e.target.value)}
                placeholder="e.g. luckperms or coreprotect"
                className="bg-black border-zinc-800 font-mono text-xs"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-zinc-800 text-xs font-mono">
                Cancel
              </Button>
              <Button type="submit" disabled={!newDbName.trim()} className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold">
                Deploy Database
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-rose-400">Drop Database</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-zinc-300 font-mono">
            Permanently destroy database <span className="text-white font-bold">{deleteTarget?.name}</span>? All tables and saved plugin records will be lost forever.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} className="border-zinc-800 text-xs font-mono">
              Cancel
            </Button>
            <Button type="button" onClick={handleDelete} className="bg-rose-600 text-white hover:bg-rose-700 text-xs font-mono">
              Drop Database
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
