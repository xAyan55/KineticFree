import React, { useState } from "react"
import { useOutletContext, useParams } from "react-router-dom"
import {
  Network as NetworkIcon,
  Plus,
  Copy,
  Check,
  Star,
  Trash2,
  Globe,
  Radio,
} from "lucide-react"
import type { Server, Allocation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const Network: React.FC = () => {
  const { server } = useOutletContext<{ server: Server }>()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const primaryAlloc = server.allocation
  const additional = server.additionalAllocations || []
  const allAllocations: Allocation[] = primaryAlloc
    ? [primaryAlloc, ...additional]
    : additional

  const copyVal = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-white">
              NETWORK & PORT ALLOCATIONS
            </h1>
            <Badge variant="zinc" className="text-[10px] font-mono">
              {allAllocations.length} / 2 Ports
            </Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            IP endpoints for game joins, query, voice chat plugins, and web maps
          </p>
        </div>

        <Button
          size="sm"
          disabled={allAllocations.length >= 2}
          onClick={() => {
            // TODO: Implement via POST /api/servers/:id/allocations when backend supports it
          }}
          className="bg-white text-black hover:bg-zinc-200 text-xs font-mono font-semibold h-9"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Assign Additional Port
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/60 shadow-xl">
        <div className="divide-y divide-zinc-800/60">
          {allAllocations.map((alloc) => {
            const isPrimary = alloc.primary || alloc.id === primaryAlloc?.id
            const fullAddress = `${alloc.ip}:${alloc.port}`

            return (
              <div
                key={alloc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-900/40 transition-colors gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    <Globe className="h-5 w-5 text-zinc-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white font-mono">{fullAddress}</span>
                      {isPrimary ? (
                        <Badge variant="success" className="text-[9px] py-0 px-1 font-mono uppercase">
                          PRIMARY
                        </Badge>
                      ) : (
                        <Badge variant="zinc" className="text-[9px] py-0 px-1 font-mono uppercase">
                          AUXILIARY
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      {alloc.alias ? `Domain alias: ${alloc.alias} • ` : ""}Node interface: 0.0.0.0
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyVal(fullAddress, alloc.id)}
                    className="h-8 text-xs font-mono border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5"
                  >
                    {copiedId === alloc.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy Address
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
