import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Server as ServerIcon,
  Cpu,
  HardDrive,
  Check,
  ArrowRight,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react"
import { servers as serverApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const SOFTWARE_OPTIONS = [
  {
    id: "egg_paper",
    name: "PaperMC",
    desc: "High performance, plugin-ready Minecraft server software based on Spigot.",
    tag: "Recommended",
    versions: ["1.20.4", "1.20.2", "1.20.1", "1.19.4", "1.18.2"],
  },
  {
    id: "egg_purpur",
    name: "Purpur",
    desc: "Ultra customizable fork of Paper designed for maximum performance & gameplay settings.",
    tag: "Ultra Fast",
    versions: ["1.20.4", "1.20.2", "1.20.1"],
  },
  {
    id: "egg_fabric",
    name: "Fabric",
    desc: "Lightweight, experimental modding toolchain for modern Minecraft versions.",
    tag: "Mods",
    versions: ["1.20.4", "1.20.2", "1.20.1", "1.19.4"],
  },
  {
    id: "egg_vanilla",
    name: "Vanilla",
    desc: "Official Mojang Minecraft server software without plugin or mod modifications.",
    tag: "Official",
    versions: ["1.20.4", "1.20.2", "1.20.1", "1.19.4", "1.16.5"],
  },
  {
    id: "egg_velocity",
    name: "Velocity",
    desc: "Next-generation, highly performant proxy server for multi-server networks.",
    tag: "Proxy",
    versions: ["3.3.0-SNAPSHOT", "3.2.0"],
  },
]

const LOCATIONS = [
  { id: "us-east", name: "US-East (Ashburn, VA)", region: "North America", tier: "High-Performance NVMe" },
  { id: "eu-central", name: "EU-Central (Frankfurt, DE)", region: "Europe", tier: "High-Performance NVMe" },
  { id: "ap-east", name: "AP-East (Tokyo, JP)", region: "Asia Pacific", tier: "High-Performance NVMe" },
]

export const CreateServer: React.FC = () => {
  const navigate = useNavigate()
  const [name, setName] = useState("My Survival Realm")
  const [description, setDescription] = useState("High-tick rate SMP server for friends")
  const [selectedSoftware, setSelectedSoftware] = useState(SOFTWARE_OPTIONS[0].id)
  const [version, setVersion] = useState(SOFTWARE_OPTIONS[0].versions[0])
  const [selectedNode, setSelectedNode] = useState(LOCATIONS[0].id)
  const [memory, setMemory] = useState(2048) // 2GB
  const [isDeploying, setIsDeploying] = useState(false)

  const activeSoftware = SOFTWARE_OPTIONS.find((s) => s.id === selectedSoftware)!

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      setIsDeploying(true)
      const newServer = await serverApi.create({
        name,
        description,
        eggId: selectedSoftware,
        nodeId: selectedNode,
        limits: {
          memory,
          swap: 0,
          disk: 10240, // 10 GB
          io: 500,
          cpu: 150, // 1.5 cores
        },
        featureLimits: {
          databases: 2,
          allocations: 1,
          backups: 2,
        },
        environment: {
          MINECRAFT_VERSION: version,
          SERVER_JARFILE: "server.jar",
        },
      })
      navigate(`/dashboard/servers/${newServer.id}/console`)
    } catch (err) {
      console.error("Failed to deploy server", err)
      setIsDeploying(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono sm:text-3xl">
            DEPLOY INSTANCE
          </h1>
          <Badge variant="success" className="font-mono text-[10px]">
            FREE TIER ELIGIBLE
          </Badge>
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          Provision a dedicated container on high-frequency NVMe hardware in under 5 seconds.
        </p>
      </div>

      <form onSubmit={handleDeploy} className="space-y-8">
        {/* Step 1: Identity */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 font-mono text-xs font-bold text-white">
              1
            </span>
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              Server Identification
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="srv-name">Server Instance Name</Label>
              <Input
                id="srv-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Community Survival"
                required
                className="bg-black border-zinc-800 text-white font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="srv-desc">Description (Optional)</Label>
              <Input
                id="srv-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Vanilla with minor datapacks"
                className="bg-black border-zinc-800 text-white font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Software Selection */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 font-mono text-xs font-bold text-white">
              2
            </span>
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              Minecraft Software & Version
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SOFTWARE_OPTIONS.map((software) => {
              const isSelected = selectedSoftware === software.id
              return (
                <div
                  key={software.id}
                  onClick={() => {
                    setSelectedSoftware(software.id)
                    setVersion(software.versions[0])
                  }}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-white bg-zinc-900 shadow-md"
                      : "border-zinc-800/80 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-sm text-white font-mono">
                      {software.name}
                    </span>
                    <Badge variant="zinc" className="text-[9px] py-0 px-1 font-mono">
                      {software.tag}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400 line-clamp-2">
                    {software.desc}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="pt-2 max-w-xs space-y-2">
            <Label htmlFor="version-select">Select Minecraft Version</Label>
            <select
              id="version-select"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 text-xs font-mono text-white focus:border-zinc-700 focus:outline-none"
            >
              {activeSoftware.versions.map((v) => (
                <option key={v} value={v}>
                  Minecraft {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 3: Location / Hardware */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 font-mono text-xs font-bold text-white">
              3
            </span>
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              Global Datacenter Edge Location
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {LOCATIONS.map((loc) => {
              const isSelected = selectedNode === loc.id
              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedNode(loc.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-white bg-zinc-900 shadow-md"
                      : "border-zinc-800/80 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white font-mono">
                      {loc.name}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {loc.region}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500 font-mono">
                    {loc.tier}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 4: Resource Sizing */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/70 p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 font-mono text-xs font-bold text-white">
              4
            </span>
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              Resource Allocation (Free Tier Quota)
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-2">
                <span className="text-zinc-400">Memory Allocation (RAM)</span>
                <span className="font-bold text-white">{(memory / 1024).toFixed(1)} GB</span>
              </div>
              <input
                type="range"
                min="1024"
                max="4096"
                step="512"
                value={memory}
                onChange={(e) => setMemory(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-600 mt-1">
                <span>1.0 GB (Vanilla)</span>
                <span>2.0 GB (Plugins SMP)</span>
                <span>4.0 GB (Max Free)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="rounded-lg bg-black border border-zinc-800/80 p-3">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">CPU Capacity</span>
                <span className="text-xs font-mono font-bold text-zinc-200">150% Dedicated</span>
              </div>
              <div className="rounded-lg bg-black border border-zinc-800/80 p-3">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Fast NVMe Disk</span>
                <span className="text-xs font-mono font-bold text-zinc-200">10.0 GB SSD</span>
              </div>
              <div className="rounded-lg bg-black border border-zinc-800/80 p-3">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Port Forwarding</span>
                <span className="text-xs font-mono font-bold text-zinc-200">1 IPv4 Dedicated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deploy Action */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/servers")}
            className="border-zinc-800 text-xs font-mono hover:bg-zinc-800"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isDeploying || !name.trim()}
            className="bg-white text-black hover:bg-zinc-200 font-bold font-mono text-xs h-10 px-6 gap-2"
          >
            {isDeploying ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                <span>PROVISIONING INSTANCE...</span>
              </>
            ) : (
              <>
                <span>DEPLOY MINECRAFT SERVER</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
