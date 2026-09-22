import React, { useState } from "react"
import {
  User as UserIcon,
  Mail,
  Save,
  Check,
  Shield,
  Calendar,
} from "lucide-react"
import { useAuthStore } from "@/lib/auth/store"
import { account as accountApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export const AccountProfile: React.FC = () => {
  const { user, setUser } = useAuthStore()

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    try {
      setSaving(true)
      const updated = await accountApi.updateProfile({ name: name.trim(), email: email.trim() })
      setUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
          ACCOUNT PROFILE
        </h1>
        <p className="mt-1 text-xs text-zinc-400 font-mono">
          Manage your identity credentials and contact information
        </p>
      </div>

      {/* Profile Card Header */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-6 flex items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl font-bold text-white shrink-0">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-full object-cover" />
          ) : (
            user?.name?.charAt(0).toUpperCase() || "U"
          )}
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold font-mono text-white truncate">{user?.name}</h2>
            <Badge variant={user?.role === "admin" ? "warning" : "zinc"} className="text-[9px] py-0 font-mono uppercase">
              {user?.role}
            </Badge>
          </div>
          <p className="text-xs text-zinc-400 font-mono">{user?.email}</p>
          <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-mono pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-6 space-y-4">
        <h3 className="text-sm font-bold font-mono text-white uppercase border-b border-zinc-800/60 pb-3">
          Personal Information
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="prof-name">Full Name</Label>
            <Input
              id="prof-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black border-zinc-800 font-mono text-xs text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prof-email">Email Address</Label>
            <Input
              id="prof-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black border-zinc-800 font-mono text-xs text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          {saved ? (
            <span className="flex items-center gap-1 text-xs font-mono text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              Profile updated successfully!
            </span>
          ) : <div />}

          <Button
            type="submit"
            disabled={saving}
            className="bg-white text-black hover:bg-zinc-200 font-mono text-xs font-bold h-9 px-4 gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </div>
  )
}
