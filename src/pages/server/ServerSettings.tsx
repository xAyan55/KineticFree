import React, { useState } from "react"
import { useOutletContext, useParams, useNavigate } from "react-router-dom"
import {
  Settings,
  Save,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Check,
} from "lucide-react"
import { servers as serverApi } from "@/lib/api"
import type { Server } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export const ServerSettings: React.FC = () => {
  const { server, reloadServer } = useOutletContext<{
    server: Server
    reloadServer: () => void
  }>()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [name, setName] = useState(server.name)
  const [description, setDescription] = useState(server.description || "")
  const [saved, setSaved] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmName, setConfirmName] = useState("")
  const [reinstallOpen, setReinstallOpen] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !name.trim()) return
    try {
      await serverApi.update(id, { name: name.trim(), description: description.trim() })
      setSaved(true)
      reloadServer()
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (!id || confirmName !== server.name) return
    try {
      await serverApi.delete(id)
      navigate("/dashboard/servers")
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-xl font-bold font-mono text-white">
          SERVER SETTINGS & DANGER ZONE
        </h1>
        <p className="mt-1 text-xs text-zinc-400 font-mono">
          Update server metadata, trigger container reinstalls, or permanently decommission instance
        </p>
      </div>

      {/* General Settings */}
      <form onSubmit={handleUpdate} className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-6 space-y-4">
        <h2 className="text-sm font-bold font-mono text-white uppercase border-b border-zinc-800/60 pb-3">
          General Identity
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="srv-rename">Instance Display Name</Label>
            <Input
              id="srv-rename"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black border-zinc-800 font-mono text-xs text-white max-w-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="srv-redesc">Description</Label>
            <Input
              id="srv-redesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-black border-zinc-800 font-mono text-xs text-white max-w-md"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          {saved ? (
            <span className="flex items-center gap-1 text-xs font-mono text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              Settings saved!
            </span>
          ) : <div />}

          <Button type="submit" className="bg-white text-black hover:bg-zinc-200 font-mono text-xs font-bold">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </form>

      {/* Reinstall Container */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-6 space-y-4">
        <h2 className="text-sm font-bold font-mono text-white uppercase border-b border-zinc-800/60 pb-3">
          Reinstall Instance
        </h2>
        <p className="text-xs text-zinc-400">
          Reinstalls the Minecraft server software using the assigned egg script. This will wipe and re-download fresh server binaries while attempting to preserve configuration files.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setReinstallOpen(true)}
          className="border-zinc-800 text-xs font-mono text-amber-400 hover:bg-amber-950/20 hover:border-amber-700"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Reinstall Server Software
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-rose-900/50 bg-rose-950/10 p-6 space-y-4">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="h-4 w-4" />
          <h2 className="text-sm font-bold font-mono uppercase">
            Danger Zone
          </h2>
        </div>

        <p className="text-xs text-zinc-400">
          Permanently destroy this server, release allocated ports, remove files, and purge all attached databases and backups. This action is irreversible.
        </p>

        <Button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="bg-rose-600 text-white hover:bg-rose-700 font-mono text-xs font-bold"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Delete Server Instance
        </Button>
      </div>

      {/* Reinstall Modal */}
      <Dialog open={reinstallOpen} onOpenChange={setReinstallOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-amber-400">Reinstall Confirmation</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-zinc-300 font-mono">
            Are you sure you want to trigger an automatic re-installation of <span className="text-white font-bold">{server.name}</span>?
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReinstallOpen(false)} className="border-zinc-800 text-xs font-mono">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                setReinstallOpen(false)
                try {
                  await serverApi.reinstall(id!)
                } catch (err: any) {
                  alert(err.message || "Failed to reinstall server.")
                }
              }}
              className="bg-amber-500 text-black hover:bg-amber-400 text-xs font-mono font-bold"
            >
              Reinstall Server
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-rose-400">Permanently Delete Server</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-xs text-zinc-300 font-mono">
              Type the exact server name <span className="text-white font-bold">{server.name}</span> below to confirm deletion:
            </p>
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={server.name}
              className="bg-black border-zinc-800 font-mono text-xs text-white"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)} className="border-zinc-800 text-xs font-mono">
              Cancel
            </Button>
            <Button
              type="button"
              disabled={confirmName !== server.name}
              onClick={handleDelete}
              className="bg-rose-600 text-white hover:bg-rose-700 text-xs font-mono font-bold disabled:opacity-50"
            >
              Confirm Decommission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
