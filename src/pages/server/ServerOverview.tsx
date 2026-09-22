import React, { useEffect, useState } from "react"
import { useOutletContext, useParams } from "react-router-dom"
import {
  Cpu,
  Activity,
  HardDrive,
  Clock,
  KeyRound,
  Server as ServerIcon,
  Copy,
  Check,
  Globe,
  Terminal,
  Shield,
  Layers,
} from "lucide-react"
import { servers as serverApi } from "@/lib/api"
import type { Server, ServerResources } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const ServerOverview: React.FC = () => {
  const { server } = useOutletContext<{ server: Server }>()
  const { id } = useParams<{ id: string }>()

  const [resources, setResources] = useState<ServerResources | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const isOnline = server.status === "running"
    if (!isOnline) {
      setResources(null)
      return
    }
    const fetchRes = async () => {
      try {
        const data = await serverApi.getResources(id)
        setResources(data)
      } catch (err) {
        setResources(null)
      }
    }
    fetchRes()
    const int = setInterval(fetchRes, 3000)
    return () => clearInterval(int)
  }, [id, server.status])

  const copyText = (val: string, key: string) => {
    navigator.clipboard.writeText(val)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const formatUptime = (seconds: number) => {
    if (!seconds) return "0s"
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (d > 0) return `${d}d ${h}h ${m}m`
    if (h > 0) return `${h}h ${m}m`
    return `${m}m ${seconds % 60}s`
  }

  const isOnline = server.status === "running"
  const telemetryAvailable = isOnline && resources !== null
  const memMb = telemetryAvailable ? (resources.memoryUsage / 1024 / 1024).toFixed(0) : null
  const memLimitMb = server.limits.memory || 2048
  const diskMb = telemetryAvailable ? (resources.diskUsage / 1024 / 1024).toFixed(0) : null
  const diskLimitMb = server.limits.disk || 10240
  const sftpHost = server.allocation?.ip ? `sftp.${server.allocation.ip}` : "Not configured"

  return (
    <div className="space-y-6 pb-12">
      {/* 4 Metric Quick Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-medium uppercase text-zinc-500">
              CPU Utilization
            </span>
            <Cpu className="h-4 w-4" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {telemetryAvailable ? `${resources.cpuUsage.toFixed(1)}%` : "—"}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              / {server.limits.cpu}%
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-300"
              style={{
                width: telemetryAvailable
                  ? `${Math.min(100, (Number(resources?.cpuUsage || 0) / (server.limits.cpu || 100)) * 100)}%`
                  : "0%",
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-medium uppercase text-zinc-500">
              Memory (RAM)
            </span>
            <Activity className="h-4 w-4" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {telemetryAvailable ? `${memMb} MB` : "—"}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              / {memLimitMb} MB
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{
                width: telemetryAvailable && memMb
                  ? `${Math.min(100, (Number(memMb) / memLimitMb) * 100)}%`
                  : "0%",
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-medium uppercase text-zinc-500">
              Disk (NVMe)
            </span>
            <HardDrive className="h-4 w-4" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {telemetryAvailable ? `${diskMb} MB` : "—"}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              / {diskLimitMb} MB
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-300"
              style={{
                width: telemetryAvailable && diskMb
                  ? `${Math.min(100, (Number(diskMb) / diskLimitMb) * 100)}%`
                  : "0%",
              }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono font-medium uppercase text-zinc-500">
              Instance Uptime
            </span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {server.status === "running" ? (resources?.uptime ? formatUptime(resources.uptime) : "Active") : "Offline"}
            </span>
          </div>
          <p className="mt-3 text-xs font-mono text-zinc-500">
            {server.status === "running" ? "Process active on Linux host" : "Container stopped"}
          </p>
        </div>
      </div>

      {/* Grid: SFTP Connection Info & Technical Specs */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* SFTP Connection Details */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-zinc-400" />
              <h2 className="text-sm font-bold font-mono text-white uppercase">
                SFTP Access Credentials
              </h2>
            </div>
            <Badge variant="zinc" className="text-[9px] py-0 px-1 font-mono">
              Port 2022
            </Badge>
          </div>

          <p className="text-xs text-zinc-400">
            Use FileZilla, Cyberduck, or WinSCP to manage server files directly over encrypted SSH File Transfer Protocol.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between rounded-lg bg-black border border-zinc-800/80 p-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Server Host</span>
                <span className="font-mono text-xs text-white">{sftpHost}</span>
              </div>
              {sftpHost !== "Not configured" && (
                <button
                  onClick={() => copyText(sftpHost, "sftp_host")}
                  className="text-zinc-400 hover:text-white"
                >
                  {copiedKey === "sftp_host" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg bg-black border border-zinc-800/80 p-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Username</span>
                <span className="font-mono text-xs text-white">{server.ownerEmail}.{server.id}</span>
              </div>
              <button
                onClick={() => copyText(`${server.ownerEmail}.${server.id}`, "sftp_user")}
                className="text-zinc-400 hover:text-white"
              >
                {copiedKey === "sftp_user" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-black border border-zinc-800/80 p-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Password</span>
                <span className="font-mono text-xs text-zinc-400">Your KineticHost account password</span>
              </div>
            </div>
          </div>
        </div>

        {/* Server Specification Sheet */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-zinc-400" />
              <h2 className="text-sm font-bold font-mono text-white uppercase">
                Container Specifications
              </h2>
            </div>
            <Badge variant="zinc" className="text-[9px] py-0 px-1 font-mono">
              Docker Engine
            </Badge>
          </div>

          <div className="divide-y divide-zinc-800/60 font-mono text-xs">
            <div className="flex justify-between py-2.5">
              <span className="text-zinc-500">Instance UUID</span>
              <span className="text-zinc-300 select-all">{server.uuid || server.id}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-zinc-500">Host Node</span>
              <span className="text-zinc-200">{server.nodeName}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-zinc-500">Software Environment</span>
              <span className="text-zinc-200">{server.softwareName} ({server.softwareVersion})</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-zinc-500">Database Allowance</span>
              <span className="text-zinc-200">{server.featureLimits?.databases || 1} MySQL Databases</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-zinc-500">Snapshot Backups</span>
              <span className="text-zinc-200">{server.featureLimits?.backups || 2} Cloud Snapshots</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-zinc-500">Provisioned At</span>
              <span className="text-zinc-400">{new Date(server.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
