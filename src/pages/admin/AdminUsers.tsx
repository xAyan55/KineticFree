import React, { useEffect, useState } from "react"
import {
  Users,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  Trash2,
  Check,
  Ban,
  RotateCcw,
} from "lucide-react"
import { users as userApi } from "@/lib/api"
import type { User } from "@/lib/types"
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

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  // New user form state
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState<"user" | "admin">("user")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await userApi.list()
      setUsers(res.data)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSuspend = async (user: User) => {
    try {
      if (user.status === "active") {
        await userApi.suspend(user.id)
      } else {
        await userApi.unsuspend(user.id)
      }
      loadUsers()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await userApi.delete(deleteTarget.id)
      setDeleteTarget(null)
      loadUsers()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            USER ACCOUNTS
          </h1>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Manage global platform accounts, staff authorizations, and account status
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Filter by user name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2 pl-9 pr-4 text-xs font-mono text-white placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
        />
      </div>

      {/* User Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/60 shadow-xl">
        <div className="divide-y divide-zinc-800/60">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-900/40 transition-colors gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white font-mono">{user.name}</span>
                    <Badge
                      variant={user.role === "admin" ? "warning" : "zinc"}
                      className="text-[9px] py-0 px-1 font-mono uppercase"
                    >
                      {user.role}
                    </Badge>
                    <Badge
                      variant={user.status === "active" ? "success" : "danger"}
                      className="text-[9px] py-0 px-1 font-mono uppercase"
                    >
                      {user.status}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    {user.email} • {user.serverCount} servers • Registered {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleSuspend(user)}
                  className="h-8 text-xs font-mono border-zinc-800 text-zinc-300 hover:bg-zinc-800 gap-1"
                >
                  {user.status === "active" ? (
                    <>
                      <Ban className="h-3.5 w-3.5 text-amber-400" />
                      Suspend
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Unsuspend
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteTarget(user)}
                  className="h-8 text-xs font-mono border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete User Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-rose-400">Delete User Account</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-zinc-300 font-mono">
            Permanently delete user account <span className="text-white font-bold">{deleteTarget?.name}</span> ({deleteTarget?.email})? All owned servers will be purged.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} className="border-zinc-800 text-xs font-mono">
              Cancel
            </Button>
            <Button type="button" onClick={handleDelete} className="bg-rose-600 text-white hover:bg-rose-700 text-xs font-mono font-bold">
              Permanently Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
