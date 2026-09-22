import React, { useEffect, useState } from "react"
import {
  KeyRound,
  Plus,
  Trash2,
  Copy,
  Check,
  Code2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react"
import { account as accountApi } from "@/lib/api"
import type { ApiKey } from "@/lib/types"
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

export const AccountApi: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [createdKey, setCreatedKey] = useState<ApiKey | null>(null)
  const [copiedSecret, setCopiedSecret] = useState(false)

  useEffect(() => {
    loadKeys()
  }, [])

  const loadKeys = async () => {
    try {
      setLoading(true)
      const data = await accountApi.getApiKeys()
      setKeys(data)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return
    try {
      const newKey = await accountApi.createApiKey(description.trim())
      setCreateOpen(false)
      setDescription("")
      setCreatedKey(newKey)
      loadKeys()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRevoke = async (id: string) => {
    try {
      await accountApi.revokeApiKey(id)
      setKeys((prev) => prev.filter((k) => k.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            API ACCESS TOKENS
          </h1>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Manage personal API tokens for automating server provisioning, backups, and restarts
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-semibold h-9"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create API Key
        </Button>
      </div>

      {/* Keys List */}
      <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/60 shadow-xl">
        {keys.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-500">
            No API credentials generated yet.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-900/40 transition-colors gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    <KeyRound className="h-4 w-4 text-zinc-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white font-mono">{key.description}</span>
                      <Badge variant="zinc" className="text-[9px] py-0 font-mono">
                        {key.identifier}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      Created {new Date(key.createdAt).toLocaleDateString()} • Last used: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRevoke(key.id)}
                  className="rounded p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Revoke API Key"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Code Snippet Example */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
            <Code2 className="h-4 w-4 text-blue-400" />
            cURL Request Example
          </span>
          <Badge variant="zinc" className="text-[9px] font-mono">REST v2</Badge>
        </div>
        <pre className="rounded-lg bg-black border border-zinc-800/80 p-3 font-mono text-xs text-zinc-300 overflow-x-auto">
{`curl -X GET "https://api.kinetic.host/v2/servers" \\
  -H "Authorization: Bearer kh_secret_your_token_here" \\
  -H "Accept: application/json"`}
        </pre>
      </div>

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono">Create API Token</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-desc">Token Description</Label>
              <Input
                id="key-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. CI/CD Deployment or Discord Bot"
                className="bg-black border-zinc-800 font-mono text-xs text-white"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-zinc-800 text-xs font-mono">
                Cancel
              </Button>
              <Button type="submit" disabled={!description.trim()} className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold">
                Generate Token
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Key Secret Revealed Modal */}
      <Dialog open={!!createdKey} onOpenChange={() => setCreatedKey(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono text-emerald-400 flex items-center gap-2">
              <Check className="h-5 w-5" />
              API Token Created
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg font-mono">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Copy your token now. For security, this secret will never be displayed again.</span>
            </div>

            <div className="rounded-lg bg-black border border-zinc-800 p-3 flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-white break-all select-all">
                {createdKey?.secret}
              </span>
              <button
                onClick={() => {
                  if (createdKey?.secret) {
                    navigator.clipboard.writeText(createdKey.secret)
                    setCopiedSecret(true)
                    setTimeout(() => setCopiedSecret(false), 2000)
                  }
                }}
                className="rounded p-1.5 text-zinc-400 hover:text-white"
              >
                {copiedSecret ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setCreatedKey(null)}
              className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold"
            >
              I Have Saved This Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
