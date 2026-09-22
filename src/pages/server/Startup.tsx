import React, { useEffect, useState } from "react"
import { useOutletContext, useParams } from "react-router-dom"
import {
  PlaySquare,
  Save,
  Check,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react"
import { startup as startupApi } from "@/lib/api"
import type { Server, StartupConfiguration } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export const Startup: React.FC = () => {
  const { server } = useOutletContext<{ server: Server }>()
  const { id } = useParams<{ id: string }>()

  const [config, setConfig] = useState<StartupConfiguration | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [vars, setVars] = useState<Record<string, string>>({})

  useEffect(() => {
    if (id) loadConfig()
  }, [id])

  const loadConfig = async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await startupApi.get(id)
      setConfig(data)
      setVars(data.environment || {})
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      await startupApi.update(id, { environment: vars })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  const startupCmd = config?.startup || (loading ? "Loading launch command..." : "Launch command unavailable")
  const dockerImg = config?.dockerImage || (loading ? "Loading runtime..." : "Image not specified")

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-white">
              STARTUP & JVM PARAMETERS
            </h1>
            <Badge variant="zinc" className="text-[10px] font-mono">
              {config?.dockerImage ? config.dockerImage.split("/").pop() || "Container" : "JVM"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Control launch flags, garbage collection options, and target Minecraft software build
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Startup Command */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white uppercase">
              Container Launch Command
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Read-Only</span>
          </div>
          <div className="rounded-lg bg-black border border-zinc-800/80 p-3 font-mono text-xs text-emerald-400 overflow-x-auto">
            {startupCmd}
          </div>
          <p className="text-[11px] font-mono text-zinc-500">
            Arguments are dynamically generated based on allocated RAM and egg environment variables below.
          </p>
        </div>

        {/* Docker Image */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5 space-y-3">
          <span className="text-xs font-mono font-bold text-white uppercase">
            Runtime Container Image
          </span>
          <div className="rounded-lg bg-black border border-zinc-800/80 p-3 font-mono text-xs text-zinc-300">
            {dockerImg}
          </div>
        </div>

        {/* Variables */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5 space-y-4">
          <span className="text-xs font-mono font-bold text-white uppercase">
            Service Environment Variables
          </span>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mc-version">Minecraft Version</Label>
              <Input
                id="mc-version"
                value={vars["MINECRAFT_VERSION"] || server.softwareVersion || "latest"}
                onChange={(e) =>
                  setVars((prev) => ({ ...prev, MINECRAFT_VERSION: e.target.value }))
                }
                className="bg-black border-zinc-800 font-mono text-xs text-white"
              />
              <span className="text-[10px] font-mono text-zinc-500 block">
                Target release build (e.g. 1.21.1 or latest)
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jar-file">Server Executable Jar</Label>
              <Input
                id="jar-file"
                value={vars["SERVER_JARFILE"] || "server.jar"}
                onChange={(e) =>
                  setVars((prev) => ({ ...prev, SERVER_JARFILE: e.target.value }))
                }
                className="bg-black border-zinc-800 font-mono text-xs text-white"
              />
              <span className="text-[10px] font-mono text-zinc-500 block">
                Relative filename in the root server folder
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="flex items-center gap-1 text-xs font-mono text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              Startup parameters updated! Restart server to apply.
            </span>
          ) : <div />}

          <Button
            type="submit"
            className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-bold h-9 px-4 gap-1.5"
          >
            <Save className="h-3.5 w-3.5" />
            Save Variables
          </Button>
        </div>
      </form>
    </div>
  )
}
