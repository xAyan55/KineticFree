import React, { useEffect, useState } from "react"
import {
  Sliders,
  Save,
  Check,
  Shield,
  Server as ServerIcon,
  AlertTriangle,
} from "lucide-react"
import { admin as adminApi } from "@/lib/api"
import type { AdminSettings } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getSettings()
      setSettings(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return
    try {
      await adminApi.updateSettings(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error(err)
    }
  }

  if (!settings && loading) {
    return <div className="p-8 text-xs font-mono text-zinc-500">Loading system settings...</div>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
          PLATFORM CONFIGURATION
        </h1>
        <p className="mt-1 text-xs text-zinc-400 font-mono">
          Global operational parameters, free-tier quotas, and system maintenance switches
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* System Flags */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-6 space-y-4">
          <h2 className="text-sm font-bold font-mono text-white uppercase border-b border-zinc-800/60 pb-3">
            System Operations & Access
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-white block">
                  Public Registration
                </span>
                <span className="text-[11px] text-zinc-400">
                  Allow new players to self-register for free Minecraft hosting accounts
                </span>
              </div>
              <Switch
                checked={settings?.registration?.enabled ?? true}
                onCheckedChange={(checked) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          registration: { ...prev.registration, enabled: checked },
                        }
                      : null
                  )
                }
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
              <div>
                <span className="font-mono text-xs font-bold text-white block">
                  System Maintenance Mode
                </span>
                <span className="text-[11px] text-zinc-400">
                  Temporarily disable game server creation and show maintenance banner to regular users
                </span>
              </div>
              <Switch
                checked={settings?.infrastructure?.maintenanceMode ?? false}
                onCheckedChange={(checked) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          infrastructure: {
                            ...prev.infrastructure,
                            maintenanceMode: checked,
                          },
                        }
                      : null
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* Free Tier Default Limits */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-6 space-y-4">
          <h2 className="text-sm font-bold font-mono text-white uppercase border-b border-zinc-800/60 pb-3">
            Default User Quotas & Resource Caps
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="def-mem">Default Memory Limit (MB)</Label>
              <Input
                id="def-mem"
                type="number"
                value={settings?.hosting?.defaultMemory ?? 2048}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          hosting: {
                            ...prev.hosting,
                            defaultMemory: Number(e.target.value),
                          },
                        }
                      : null
                  )
                }
                className="bg-black border-zinc-800 font-mono text-xs text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="def-cpu">Default CPU Priority (%)</Label>
              <Input
                id="def-cpu"
                type="number"
                value={settings?.hosting?.defaultCpu ?? 100}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          hosting: {
                            ...prev.hosting,
                            defaultCpu: Number(e.target.value),
                          },
                        }
                      : null
                  )
                }
                className="bg-black border-zinc-800 font-mono text-xs text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="def-disk">Default Disk Space (MB)</Label>
              <Input
                id="def-disk"
                type="number"
                value={settings?.hosting?.defaultDisk ?? 10240}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          hosting: {
                            ...prev.hosting,
                            defaultDisk: Number(e.target.value),
                          },
                        }
                      : null
                  )
                }
                className="bg-black border-zinc-800 font-mono text-xs text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-srv">Max Servers Per Free Account</Label>
              <Input
                id="max-srv"
                type="number"
                value={settings?.hosting?.maxServersPerUser ?? 2}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev
                      ? {
                          ...prev,
                          hosting: {
                            ...prev.hosting,
                            maxServersPerUser: Number(e.target.value),
                          },
                        }
                      : null
                  )
                }
                className="bg-black border-zinc-800 font-mono text-xs text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          {saved ? (
            <span className="flex items-center gap-1 text-xs font-mono text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              Platform settings persisted!
            </span>
          ) : <div />}

          <Button type="submit" className="bg-white text-black hover:bg-zinc-200 font-mono text-xs font-bold h-9 px-4 gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Save Platform Settings
          </Button>
        </div>
      </form>
    </div>
  )
}
