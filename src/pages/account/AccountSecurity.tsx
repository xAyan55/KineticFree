import React, { useEffect, useState } from "react"
import {
  Shield,
  KeyRound,
  Laptop,
  Smartphone,
  Save,
  Check,
  Trash2,
  Lock,
} from "lucide-react"
import { account as accountApi } from "@/lib/api"
import type { Session } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export const AccountSecurity: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [sessions, setSessions] = useState<Session[]>([])
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const data = await accountApi.getSessions()
      setSessions(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      return
    }

    try {
      setSavingPassword(true)
      await accountApi.changePassword(currentPassword, newPassword)
      setPasswordSaved(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setPasswordSaved(false), 2500)
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password")
    } finally {
      setSavingPassword(false)
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await accountApi.revokeSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
          SECURITY & SESSIONS
        </h1>
        <p className="mt-1 text-xs text-zinc-400 font-mono">
          Update account password, enable two-factor authentication, and monitor active sessions
        </p>
      </div>

      {/* Change Password */}
      <form onSubmit={handlePasswordChange} className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-6 space-y-4">
        <h2 className="text-sm font-bold font-mono text-white uppercase border-b border-zinc-800/60 pb-3">
          Modify Account Password
        </h2>

        {passwordError && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 font-mono">
            {passwordError}
          </div>
        )}

        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="curr-pwd">Current Password</Label>
            <Input
              id="curr-pwd"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-black border-zinc-800 font-mono text-xs text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-pwd">New Password</Label>
            <Input
              id="new-pwd"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-black border-zinc-800 font-mono text-xs text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conf-pwd">Confirm New Password</Label>
            <Input
              id="conf-pwd"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-black border-zinc-800 font-mono text-xs text-white"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          {passwordSaved ? (
            <span className="flex items-center gap-1 text-xs font-mono text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              Password updated successfully!
            </span>
          ) : <div />}

          <Button
            type="submit"
            disabled={savingPassword}
            className="bg-white text-black hover:bg-zinc-200 font-mono text-xs font-bold"
          >
            <Lock className="h-3.5 w-3.5 mr-1.5" />
            {savingPassword ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>

      {/* Two-Factor Authentication */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-zinc-400" />
            <h2 className="text-sm font-bold font-mono text-white uppercase">
              Two-Factor Authentication (2FA)
            </h2>
          </div>
          <Badge variant="zinc" className="text-[9px] py-0 font-mono uppercase">
            TOTP
          </Badge>
        </div>

        <p className="text-xs text-zinc-400">
          Enforce two-factor authentication via Google Authenticator, Authy, or 1Password for every sign-in attempt.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => alert("Simulated: 2FA Setup QR code displayed.")}
          className="border-zinc-800 text-xs font-mono hover:bg-zinc-800"
        >
          Configure Authenticator App
        </Button>
      </div>

      {/* Active Sessions */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
          <div className="flex items-center gap-2">
            <Laptop className="h-4 w-4 text-zinc-400" />
            <h2 className="text-sm font-bold font-mono text-white uppercase">
              Active Sign-In Sessions
            </h2>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await accountApi.revokeAllSessions()
              setSessions((prev) => prev.filter((s) => s.current))
            }}
            className="h-7 text-[11px] font-mono border-zinc-800 hover:bg-zinc-800 text-zinc-400"
          >
            Revoke All Other Sessions
          </Button>
        </div>

        <div className="divide-y divide-zinc-800/60 text-xs font-mono">
          {sessions.map((sess) => (
            <div key={sess.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <Laptop className="h-4 w-4 text-zinc-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{sess.browser} on {sess.os}</span>
                    {sess.current && (
                      <Badge variant="success" className="text-[9px] py-0 px-1 font-mono uppercase">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    IP: {sess.ip} • Last active {new Date(sess.lastActive).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {!sess.current && (
                <button
                  onClick={() => handleRevokeSession(sess.id)}
                  className="rounded p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                  title="Revoke session"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
