import React, { useEffect, useState } from "react"
import {
  Layers,
  Plus,
  Trash2,
  FileCode,
  Terminal,
  Box,
} from "lucide-react"
import { eggs as eggApi } from "@/lib/api"
import type { Egg } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const AdminEggs: React.FC = () => {
  const [eggList, setEggList] = useState<Egg[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEggs()
  }, [])

  const loadEggs = async () => {
    try {
      setLoading(true)
      const data = await eggApi.list()
      setEggList(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">
            SERVICE EGGS & TEMPLATES
          </h1>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Pterodactyl-compatible egg manifests with startup commands and Docker runtime images
          </p>
        </div>
      </div>

      {eggList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500 font-mono text-xs">
          No service eggs installed.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {eggList.map((egg) => (
            <div
              key={egg.id}
              className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5 space-y-4 backdrop-blur flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <Box className="h-4 w-4 text-zinc-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white font-mono">{egg.name}</h3>
                      <span className="text-[10px] text-zinc-500 font-mono">{egg.category}</span>
                    </div>
                  </div>
                  <Badge variant="zinc" className="text-[9px] py-0 px-1 font-mono">
                    {egg.author}
                  </Badge>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2">{egg.description}</p>

                <div className="space-y-2 pt-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 block">Docker Image</span>
                    <span className="text-zinc-300 truncate block text-[11px]">{egg.dockerImage}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 block">Startup Command</span>
                    <div className="rounded bg-black border border-zinc-800/80 p-2 text-[11px] text-emerald-400 truncate">
                      {egg.startupCommand}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>{egg.variables?.length || 0} variables</span>
                <span>{egg.supportedVersions?.length || 0} builds</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
